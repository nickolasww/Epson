"""
Build FAISS index from Epson FAQ JSON files.

Usage (from the backend/ directory):
    python scripts/build_index.py

Output:
    data/faiss_index/faq.index   — FAISS binary index
    data/faiss_index/faq_docs.pkl — document metadata list

With 59,077 FAQs this takes ~5-15 minutes on CPU.
Progress is printed every 1,000 documents.
"""
import os
import sys
import json
import pickle
import logging
import numpy as np
from pathlib import Path

# Allow running from the backend/ directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def load_faq_docs(data_dir: str) -> list[dict]:
    """Load all FAQ JSON files and flatten into a list of documents."""
    docs = []
    data_path = Path(data_dir)

    if not data_path.exists():
        logger.error("FAQ data directory not found: %s", data_dir)
        sys.exit(1)

    json_files = sorted(data_path.glob("*.json"))
    logger.info("Found %d JSON files in %s", len(json_files), data_dir)

    for json_file in json_files:
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                product = json.load(f)
        except Exception as e:
            logger.warning("Skipping %s: %s", json_file.name, e)
            continue

        model_name = product.get("model", {}).get("name", "Unknown")
        sku = product.get("model", {}).get("sku", "")
        category = product.get("category", "")
        series = product.get("series", "")

        seen_slugs = set()

        for section in product.get("faq_sections", []):
            section_name = section.get("section_name", "")
            for faq in section.get("faqs", []):
                slug = faq.get("faq_slug", "")
                question = faq.get("question", "").strip()
                answer = faq.get("answer", "").strip()

                if not question or not answer:
                    continue
                # De-duplicate within this product file
                if slug and slug in seen_slugs:
                    continue
                if slug:
                    seen_slugs.add(slug)

                docs.append({
                    "question": question,
                    "answer": answer,
                    "model": model_name,
                    "sku": sku,
                    "category": category,
                    "series": series,
                    "section": section_name,
                    "faq_url": faq.get("faq_url", ""),
                    "text": f"{question} {answer}",
                })

    logger.info("Total documents loaded: %d", len(docs))
    return docs


def build_index(docs: list[dict], index_dir: str, batch_size: int = 512):
    """Embed documents with sentence-transformers and build a FAISS index."""
    import faiss
    from sentence_transformers import SentenceTransformer

    os.makedirs(index_dir, exist_ok=True)

    logger.info("Loading sentence transformer model (paraphrase-multilingual-MiniLM-L12-v2)...")
    model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
    dim = model.get_sentence_embedding_dimension()
    logger.info("Embedding dimension: %d", dim)

    # IndexFlatIP with normalized vectors = cosine similarity
    index = faiss.IndexFlatIP(dim)

    texts = [d["text"] for d in docs]
    total = len(texts)
    all_embeddings = []

    logger.info("Encoding %d documents in batches of %d...", total, batch_size)
    for start in range(0, total, batch_size):
        batch = texts[start : start + batch_size]
        embeddings = model.encode(
            batch,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        all_embeddings.append(embeddings)
        done = min(start + batch_size, total)
        if done % 5000 == 0 or done == total:
            logger.info("  Encoded %d / %d", done, total)

    all_embeddings = np.vstack(all_embeddings).astype(np.float32)
    index.add(all_embeddings)

    index_path = os.path.join(index_dir, "faq.index")
    docs_path = os.path.join(index_dir, "faq_docs.pkl")

    faiss.write_index(index, index_path)
    with open(docs_path, "wb") as f:
        pickle.dump(docs, f)

    logger.info("Saved FAISS index  → %s (%d vectors)", index_path, index.ntotal)
    logger.info("Saved document list → %s", docs_path)
    return index_path, docs_path


if __name__ == "__main__":
    from core.config import get_settings

    settings = get_settings()

    faq_data_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", settings.FAQ_DATA_PATH)
    )
    index_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", settings.FAISS_INDEX_PATH)
    )

    logger.info("FAQ data path : %s", faq_data_path)
    logger.info("Index output  : %s", index_dir)

    docs = load_faq_docs(faq_data_path)
    if not docs:
        logger.error("No documents loaded. Aborting.")
        sys.exit(1)

    build_index(docs, index_dir)
    logger.info("Done. Index ready for use.")
