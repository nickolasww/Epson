import { useState, useEffect } from "react";
import { Button, Input, Avatar, Typography, message } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import { getMe, UpdateProfile } from "@/api/auth/api";
import { TUserProfile } from "@/api/auth/type";

const { Title, Text } = Typography;

const Profile = () => {
  const [user, setUser] = useState<TUserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [editFullName, setEditFullName] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [editEmail, setEditEmail] = useState(false);

const now = new Date();
const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
const day = now.getDate();                                              
const month = now.toLocaleDateString("en-US", { month: "long" });     
const year = now.getFullYear();                                        
const today = `${weekday}, ${day} ${month} ${year}`; 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMe();
        const userData = data.users;
        setUser(userData);
        setFullName(userData.Fullname ?? "");
        setUsername(userData.username ?? "");
        setEmail(userData.email ?? "");
      } catch (error) {
        message.error("Gagal memuat profil");
      }
    };

    fetchProfile();
  }, []);
  

  const handleSaveProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = await UpdateProfile({
        Fullname: fullName,
        username: username,
        email: email,
      });
      // Update state user dengan data terbaru
      setUser(data.users);
      // Matikan semua mode edit
      setEditFullName(false);
      setEditUsername(false);
      setEditEmail(false);
      message.success("Profil berhasil diperbarui");
    } catch (error) {
      message.error("Gagal memperbarui profil");
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <div className=" bg-gray-50 p-6 md:p-10 mt-22">
      <div className="flex flex-col gap-3 mb-5">
        <Title level={3} style={{ margin: 0 }}>
          Welcome, {user?.Fullname}!
        </Title>
        <Text style={{ fontSize: "13px" }}>{today}</Text>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header + Banner (bagian atas card) */}
        <div
          style={{
            background: "linear-gradient(to right, #4ade80, #365314)",
            padding: "24px 24px 70px 24px",
          }}
        ></div>

        {/* Avatar + Name + Button (overlap area) */}
        <div
          className="flex items-end justify-between px-6"
          style={{ marginBottom: "24px", marginTop: "20px" }}
        >
          <div className="flex items-center gap-4 ">
            <Avatar
              size={80}
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#e5e7eb",
                color: "#6b7280",
                border: "4px solid #fff",
                flexShrink: 0,
              }}
            />
            <div style={{ marginBottom: "4px" }}>
              <Text
                strong
                style={{ fontSize: "16px", display: "block", color: "#111827" }}
              >
                {user?.username}
              </Text>
              <Text type="secondary" style={{ fontSize: "13px" }}>
                {user?.email}
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            loading={loadingProfile}
            onClick={handleSaveProfile}
            style={{
              backgroundColor: "#3b82f6",
              borderColor: "#3b82f6",
              marginBottom: "20px",
            }}
          >
            Simpan Perubahan
          </Button>
        </div>

        {/* Form Fields */}
        <div className="px-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <Text
                type="secondary"
                style={{ fontSize: "13px", display: "block", marginBottom: 6 }}
              >
                Full Name
              </Text>
              <Input
                value={fullName}
                disabled={!editFullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
                suffix={
                  <EditOutlined
                    style={{ color: "#9ca3af", cursor: "pointer" }}
                    onClick={() => setEditFullName(!editFullName)}
                  />
                }
              />
            </div>

            <div>
              <Text
                type="secondary"
                style={{ fontSize: "13px", display: "block", marginBottom: 6 }}
              >
                Username
              </Text>
              <Input
                value={username}
                disabled={!editUsername}
                onChange={(e) => setUsername(e.target.value)}
                style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
                suffix={
                  <EditOutlined
                    style={{ color: "#9ca3af", cursor: "pointer" }}
                    onClick={() => setEditUsername(!editUsername)}
                  />
                }
              />
            </div>

            <div>
              <Text
                type="secondary"
                style={{ fontSize: "13px", display: "block", marginBottom: 6 }}
              >
                Email
              </Text>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
                disabled={!editEmail}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
