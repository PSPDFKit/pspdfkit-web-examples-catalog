import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1>404 - Not Found</h1>
      <div>
        <Link href="/" target="_top">
          Go back to Home
        </Link>
      </div>
    </div>
  );
}
