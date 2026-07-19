import { redirect } from "next/navigation";

export const metadata = {
  title: "AKC Admin | Analitik ve SEO",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnalyticsPage() {
  redirect("/admin#analytics");
}
