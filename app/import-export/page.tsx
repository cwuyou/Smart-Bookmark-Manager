"use client"

import { ImportExport } from "@/components/import-export"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"
import type { DashboardData } from "../page"

export default function ImportExportPage() {
  const router = useRouter()

  const handleImport = (data: DashboardData) => {
    try {
      localStorage.setItem("dashboard-data", JSON.stringify(data))
      router.push("/")  // 导入成功后返回主页
    } catch (error) {
      console.error("Failed to save imported data:", error)
    }
  }

  const getCurrentData = (): DashboardData => {
    try {
      const savedData = localStorage.getItem("dashboard-data")
      if (savedData) {
        return JSON.parse(savedData)
      }
    } catch (error) {
      console.error("Failed to load current data:", error)
    }
    return { groups: [], standaloneBookmarks: [] }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar showSearch={false} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ImportExport 
            data={getCurrentData()} 
            onImport={handleImport}
          />
        </div>
      </main>
    </div>
  )
} 