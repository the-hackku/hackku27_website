import { NotionAPI } from "notion-client";
import NotionPage from "@/components/NotionPage";

// biome-ignore lint/security/noSecrets: Not a secret, just the ID of a Notion page
const PAGE_ID = "HackerDoc-HackKU-26-2be9e50fddb580418f10d4c9ba1b14e1";
const notion = new NotionAPI();

export default async function InfoPage() {
  const recordMap = await notion.getPage(PAGE_ID);
  return (
    <div className="py-8">
      <NotionPage recordMap={recordMap} />
    </div>
  );
}
