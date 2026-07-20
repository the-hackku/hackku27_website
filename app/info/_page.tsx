import { getInfoPage } from "@/app/actions/infoPage";
import InfoPageView from "@/components/info/InfoPageView";
import { auth } from "@/lib/auth/auth";

export default async function EditableInfoPage() {
  const [data, session] = await Promise.all([getInfoPage(), auth()]);

  const isAdmin = session?.user?.role === "ADMIN";

  return <InfoPageView initialData={data} isAdmin={isAdmin} />;
}
