"use client";

import SwaggerUI from "swagger-ui-react";

export default function SwaggerPage() {
  return (
    <main className="flex flex-1 flex-col bg-white">
      <SwaggerUI
        url="/api/swagger"
        docExpansion="list"
        defaultModelsExpandDepth={-1}
        layout="BaseLayout"
        deepLinking
      />
    </main>
  );
}
