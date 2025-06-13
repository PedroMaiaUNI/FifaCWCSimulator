"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface TeamCardProps {
  team: string
  isSelected?: boolean
  selectionType?: "first" | "second" | null
  onClick?: () => void
  size?: "sm" | "md" | "lg"
}

export function TeamCard({ team, isSelected, selectionType, onClick, size = "md" }: TeamCardProps) {
  const sizeClasses = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  }

  const imageSizes = {
    sm: 24,
    md: 32,
    lg: 48,
  }

  const getSelectionStyle = () => {
    if (!isSelected) return ""
    if (selectionType === "first") return "ring-2 ring-green-500 bg-green-50"
    if (selectionType === "second") return "ring-2 ring-red-500 bg-red-50"
    return "ring-2 ring-blue-500 bg-blue-50"
  }

  return (
    <Card
      className={cn("cursor-pointer transition-all hover:shadow-md", getSelectionStyle(), sizeClasses[size])}
      onClick={onClick}
    >
      <CardContent className="p-2 text-center">
        <div className="flex flex-col items-center gap-2">
          <Image
            src={`/teams/${team.toLowerCase().replace(/\s+/g, "-")}.png`}
            alt={`${team} logo`}
            width={imageSizes[size]}
            height={imageSizes[size]}
            className="object-contain"
            onError={(e) => {
              // Fallback to placeholder if team logo not found
              e.currentTarget.src = `/placeholder.svg?height=${imageSizes[size]}&width=${imageSizes[size]}`
            }}
          />
          <span
            className={cn(
              "font-medium text-center leading-tight",
              size === "sm" && "text-xs",
              size === "md" && "text-sm",
              size === "lg" && "text-base",
            )}
          >
            {team}
          </span>
          {isSelected && (
            <div
              className={cn(
                "text-xs font-bold px-2 py-1 rounded",
                selectionType === "first" && "bg-green-100 text-green-800",
                selectionType === "second" && "bg-red-100 text-red-800",
              )}
            >
              {selectionType === "first" ? "1º" : "2º"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
