import { useEffect } from "react";
import type { Route } from "./+types/home";
import { useNavigate } from "react-router";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Future Tech Addis Dashboard" },
    { name: "description", content: "Welcome to Future Tech Event Dashboard" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  useEffect(()=>{
    navigate('/login')
  },[])
  return <></>;
}
