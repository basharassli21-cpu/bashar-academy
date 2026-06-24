import { requireRole } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const statusColors: Record<TicketStatus, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "destructive",
  IN_PROGRESS: "default",
  RESOLVED: "secondary",
  CLOSED: "outline",
};

const priorityIcons: Record<TicketPriority, React.ElementType> = {
  LOW: ArrowDown,
  MEDIUM: ArrowUp,
  HIGH: ArrowUp,
  URGENT: ArrowUp,
};

const priorityColors: Record<TicketPriority, string> = {
  LOW: "text-slate-500",
  MEDIUM: "text-blue-500",
  HIGH: "text-orange-500",
  URGENT: "text-red-500",
};

export default async function AdminAcademySupportPage() {
  await requireRole(["ADMIN"]);

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { fullName: true, email: true } },
      _count: { select: { messages: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="text-sm text-muted-foreground">
          Support tickets ({tickets.length})
        </p>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No support tickets
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => {
                const PriorityIcon = priorityIcons[ticket.priority];
                return (
                  <TableRow key={ticket.id}>
                    <TableCell className="max-w-[250px] font-medium">
                      <span className="line-clamp-1">
                        {ticket.subject}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {ticket.user.fullName}
                        </span>
                        {ticket.user.email && (
                          <span className="text-xs text-muted-foreground">
                            {ticket.user.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[ticket.status]}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <PriorityIcon
                          className={`size-3.5 ${priorityColors[ticket.priority]}`}
                        />
                        <span className="capitalize">
                          {ticket.priority.toLowerCase()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MessageSquare className="size-3" />
                        {ticket._count.messages}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {ticket.updatedAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {ticket.createdAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
