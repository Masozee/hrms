import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Users, DollarSign } from "lucide-react"

import { Button } from "../../components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"

export type Room = {
  id: number
  roomNumber: string
  roomType: string
  status: string
  baseRate: number
  maxOccupancy: number
  floor: number
  description?: string
  amenities?: string[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800';
    case 'occupied': return 'bg-red-100 text-red-800';
    case 'dirty': return 'bg-yellow-100 text-yellow-800';
    case 'maintenance': return 'bg-orange-100 text-orange-800';
    case 'blocked': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'available': return 'Available';
    case 'occupied': return 'Occupied';
    case 'dirty': return 'Needs Cleaning';
    case 'maintenance': return 'Maintenance';
    case 'blocked': return 'Blocked';
    default: return status;
  }
};

const getRoomTypeLabel = (type: string) => {
  switch (type) {
    case 'single': return 'Single Room';
    case 'double': return 'Double Room';
    case 'suite': return 'Suite';
    case 'deluxe': return 'Deluxe Room';
    case 'family': return 'Family Room';
    default: return type;
  }
};

export const columns = (onEdit: (room: Room) => void, onDelete: (room: Room) => void, userRole: string): ColumnDef<Room>[] => [
  {
    accessorKey: "roomNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Room Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const room = row.original
      return (
        <div className="font-medium">
          Room {room.roomNumber}
        </div>
      )
    },
  },
  {
    accessorKey: "roomType",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const room = row.original
      return <div>{getRoomTypeLabel(room.roomType)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const room = row.original
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
          {getStatusLabel(room.status)}
        </span>
      )
    },
  },
  {
    accessorKey: "floor",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Floor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "maxOccupancy",
    header: "Capacity",
    cell: ({ row }) => {
      const room = row.original
      return (
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          <span>{room.maxOccupancy}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "baseRate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Rate/Night
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const room = row.original
      return (
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-1" />
          <span>{room.baseRate}</span>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const room = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(room.id.toString())}
            >
              Copy room ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(room)}>Edit room</DropdownMenuItem>
            {userRole === 'admin' && (
              <DropdownMenuItem onClick={() => onDelete(room)}>Delete room</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]