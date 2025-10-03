import type { Metadata } from "next";
import type { ReactNode } from "react";
import "swagger-ui-react/swagger-ui.css";

export const metadata: Metadata = {
  title: "Swagger UI | Kanban Lite API",
};

export default function SwaggerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
