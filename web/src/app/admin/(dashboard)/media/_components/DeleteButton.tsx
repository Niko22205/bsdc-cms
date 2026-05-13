"use client"

export function DeleteButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("Delete this media record? This cannot be undone.")) e.preventDefault()
      }}
      className="text-xs text-red-500 hover:text-red-700"
    >
      Delete
    </button>
  )
}
