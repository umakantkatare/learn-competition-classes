"use client";

import Link from "next/link";
import { Eye, MoreHorizontal, Pencil, Power } from "lucide-react";

import type { TopicWithSubject } from "@/services/academic/topic/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopicTableProps {
  topics: TopicWithSubject[];
  onStatusChange?: (topic: TopicWithSubject) => void;
}

export function TopicTable({ topics, onStatusChange }: TopicTableProps) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold text-text-primary">
              Topic
            </TableHead>

            <TableHead className="font-semibold text-text-primary">
              Subject
            </TableHead>

            <TableHead className="font-semibold text-text-primary">
              Slug
            </TableHead>

            <TableHead className="font-semibold text-text-primary">
              Status
            </TableHead>

            <TableHead className="w-[80px] text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {topics.map((topic) => (
            <TableRow key={topic.id}>
              {/* Topic */}
              <TableCell>
                <Link
                  href={`/academic/topics/${topic.id}`}
                  className="font-medium text-text-primary transition-colors hover:text-brand-primary"
                >
                  {topic.name}
                </Link>
              </TableCell>

              {/* Subject */}
              <TableCell>
                <Link
                  href={`/academic/subjects/${topic.subject.id}`}
                  className="text-sm text-text-secondary transition-colors hover:text-brand-primary"
                >
                  {topic.subject.name}
                </Link>
              </TableCell>

              {/* Slug */}
              <TableCell>
                <span className="text-sm text-text-secondary">
                  {topic.slug}
                </span>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge variant={topic.isActive ? "default" : "secondary"}>
                  {topic.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={`Actions for ${topic.name}`}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/academic/topics/${topic.id}`}>
                        <Eye className="mr-2 size-4" />
                        View
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={`/academic/topics/${topic.id}/edit`}>
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>

                    {onStatusChange && (
                      <>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => onStatusChange(topic)}>
                          <Power className="mr-2 size-4" />

                          {topic.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
