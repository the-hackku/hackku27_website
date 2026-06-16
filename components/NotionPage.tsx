"use client";

import type { ExtendedRecordMap } from "notion-types";
import { NotionRenderer } from "react-notion-x";
import Image from "next/image";
import Link from "next/link";

export default function NotionPage({ recordMap }: { recordMap: ExtendedRecordMap }) {
  return (
    <NotionRenderer 
      recordMap={recordMap} 
      fullPage={true}
      darkMode={false}
      components={{
        nextImage: Image,
        nextLink: Link,
      }}
      disableHeader={true}
    />
  )
}
