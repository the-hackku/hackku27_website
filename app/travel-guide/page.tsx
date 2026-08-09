import { cacheTag } from "next/cache";
import { NotionAPI } from "notion-client";
import NotionPage from "@/components/NotionPage";

// biome-ignore lint/security/noSecrets: Not a secret, just the ID of a Notion page
const PAGE_ID = "Travel-Guide-33a9e50fddb580b5a15af1e605489642";
const notion = new NotionAPI();

export default async function TravelGuidePage() {
  "use cache";
  cacheTag("document-travel-guide");
  const recordMap = await notion.getPage(PAGE_ID);
  return (
    <div className="py-8">
      <NotionPage recordMap={recordMap} />
    </div>
  );
}
