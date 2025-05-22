"use client"

import { useState, useEffect } from "react"
import type { Talk } from "@/lib/talks-data"

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Talk[]>([])

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("tskaigi-bookmarks")
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks))
      } catch (e) {
        console.error("Failed to parse bookmarks from localStorage", e)
        localStorage.removeItem("tskaigi-bookmarks")
      }
    }
  }, [])

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (bookmarks.length > 0) {
      localStorage.setItem("tskaigi-bookmarks", JSON.stringify(bookmarks))
    } else {
      localStorage.removeItem("tskaigi-bookmarks")
    }
  }, [bookmarks])

  // Check if a talk is bookmarked
  const isBookmarked = (talk: Talk) => {
    return bookmarks.some((bookmark) => bookmark.id === talk.id)
  }

  // Toggle bookmark status for a talk
  const toggleBookmark = (talk: Talk) => {
    if (isBookmarked(talk)) {
      setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== talk.id))
    } else {
      setBookmarks([...bookmarks, talk])
    }
  }

  return {
    bookmarks,
    toggleBookmark,
    isBookmarked,
  }
}
