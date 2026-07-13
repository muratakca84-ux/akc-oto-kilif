import AdminDashboard from "./AdminDashboard";

export const metadata = {

  title: "AKC Admin Panel",

  robots: {

    index: false,

    follow: false,

  },

};

export default function AdminPage() {

  return <AdminDashboard />;

}