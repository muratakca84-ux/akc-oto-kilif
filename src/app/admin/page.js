import AdminDashboard from "./AdminDashboard";

export const metadata = {
  title: "AKC Admin Panel | Yönetim",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
