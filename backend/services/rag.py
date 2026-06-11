"""
RAG service: FAISS-based semantic search over Epson FAQ data + Gemini answer generation.
Build the index first by running: python scripts/build_index.py
"""
import os
import json
import pickle
import logging
from typing import Optional
import numpy as np
import google.generativeai as genai
from core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Lazy-loaded globals
_index = None
_docs = None
_embed_model = None
_genai_model = None


def _load_embed_model():
    global _embed_model
    if _embed_model is None:
        from sentence_transformers import SentenceTransformer
        logger.info("Loading sentence transformer model...")
        _embed_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
        logger.info("Sentence transformer loaded.")
    return _embed_model


def _load_genai_model():
    global _genai_model
    if _genai_model is None:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _genai_model = genai.GenerativeModel("gemini-2.5-flash")
        logger.info("Gemini model loaded.")
    return _genai_model


def load_faiss_index() -> bool:
    """Load FAISS index and documents from disk. Returns True on success."""
    global _index, _docs
    try:
        import faiss
        index_path = os.path.join(settings.FAISS_INDEX_PATH, "faq.index")
        docs_path = os.path.join(settings.FAISS_INDEX_PATH, "faq_docs.pkl")

        if not os.path.exists(index_path) or not os.path.exists(docs_path):
            logger.warning(
                "FAISS index not found at %s. Run scripts/build_index.py first.",
                settings.FAISS_INDEX_PATH,
            )
            return False

        _index = faiss.read_index(index_path)
        with open(docs_path, "rb") as f:
            _docs = pickle.load(f)

        logger.info("FAISS index loaded: %d documents.", _index.ntotal)
        return True
    except Exception as e:
        logger.error("Failed to load FAISS index: %s", e)
        return False


def _embed(text: str) -> np.ndarray:
    model = _load_embed_model()
    vec = model.encode([text], normalize_embeddings=True)
    return vec.astype(np.float32)


def search_faqs(query: str, top_k: int = 5) -> list[dict]:
    """Search the FAISS index for the most relevant FAQs."""
    if _index is None or _docs is None:
        return []
    vec = _embed(query)
    distances, indices = _index.search(vec, top_k)
    results = []
    for score, idx in zip(distances[0], indices[0]):
        if idx < 0 or idx >= len(_docs):
            continue
        doc = _docs[idx].copy()
        doc["score"] = float(score)
        results.append(doc)
    return results


async def generate_answer(query: str, session_id: Optional[str] = None) -> dict:
    """
    Full RAG pipeline:
    1. Retrieve relevant FAQs from FAISS
    2. Build context prompt
    3. Generate answer with Gemini
    """
    import uuid

    if session_id is None:
        session_id = str(uuid.uuid4())

    # If index not loaded, fall back gracefully
    if _index is None:
        not_ready_msg = (
            "Maaf, sistem pencarian FAQ sedang dipersiapkan. "
            "Silakan coba beberapa saat lagi atau hubungi customer support."
        )
        return {"response": not_ready_msg, "session_id": session_id, "sources": []}

    retrieved = search_faqs(query, top_k=5)

    if not retrieved:
        fallback_msg = (
            "Maaf, saya tidak menemukan informasi yang relevan untuk pertanyaan Anda. "
            "Silakan hubungi customer support Epson untuk bantuan lebih lanjut."
        )
        return {"response": fallback_msg, "session_id": session_id, "sources": []}

    # Build context from top results
    context_parts = []
    for i, doc in enumerate(retrieved, 1):
        context_parts.append(
            f"[FAQ {i}]\n"
            f"Model: {doc.get('model', 'General')}\n"
            f"Pertanyaan: {doc['question']}\n"
            f"Jawaban: {doc['answer']}"
        )
    context = "\n\n".join(context_parts)

    prompt = (
        "Kamu adalah asisten teknis Epson yang membantu pengguna menyelesaikan masalah printer. "
        "Jawab pertanyaan pengguna dalam bahasa yang sama dengan pertanyaan mereka (Indonesia atau Inggris). "
        "Gunakan HANYA informasi dari konteks FAQ di bawah ini. "
        "Jika konteks tidak cukup, sarankan menghubungi Epson Service Center.\n\n"
        f"=== Konteks FAQ ===\n{context}\n\n"
        f"=== Pertanyaan Pengguna ===\n{query}\n\n"
        "Berikan jawaban yang jelas, ringkas, dan praktis. "
        "Jika ada langkah-langkah, tampilkan dalam format daftar bernomor."
    )

    try:
        model = _load_genai_model()
        response = model.generate_content(prompt)
        answer_text = response.text.strip()
    except Exception as e:
        logger.error("Gemini generation failed: %s", e)
        answer_text = (
            "Maaf, terjadi kesalahan saat memproses pertanyaan Anda. "
            "Silakan coba lagi atau hubungi customer support."
        )

    sources = [
        {
            "question": d["question"],
            "model": d.get("model", "General"),
            "score": round(d["score"], 3),
        }
        for d in retrieved[:3]
    ]

    return {"response": answer_text, "session_id": session_id, "sources": sources}
