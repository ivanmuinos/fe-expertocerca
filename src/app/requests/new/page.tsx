"use client";

import { useEffect } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";

export default function NuevaSolicitudPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/requests/new/problem");
  }, [navigate]);

  return null;
}
