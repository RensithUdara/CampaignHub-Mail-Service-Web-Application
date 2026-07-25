"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Search, Users, UserRound } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { Contact, Group } from "@/lib/types";

type Props = {
  selectedContactIds: Set<string>;
  selectedGroupIds: Set<string>;
  onChangeContacts: (ids: Set<string>) => void;
  onChangeGroups: (ids: Set<string>) => void;
};

export default function RecipientPicker({
  selectedContactIds,
  selectedGroupIds,
  onChangeContacts,
  onChangeGroups,
}: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"groups" | "contacts">("groups");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [contactsRes, groupsRes] = await Promise.all([
          fetch("/api/contacts", { cache: "no-store" }),
          fetch("/api/groups", { cache: "no-store" }),
        ]);
        const contactsData = await contactsRes.json();
        const groupsData = await groupsRes.json();
        setContacts(contactsData.contacts ?? []);
        setGroups(groupsData.groups ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function toggleContact(id: string) {
    const next = new Set(selectedContactIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChangeContacts(next);
  }

  function toggleGroup(id: string) {
    const next = new Set(selectedGroupIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChangeGroups(next);
  }

  const filteredContacts = contacts.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGroups = groups.filter(
    (g) => !search || g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center border border-stone-200 bg-white py-8" style={{ borderRadius: 8 }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="border border-stone-200 bg-white" style={{ borderRadius: 8 }}>
      <div className="space-y-2 border-b border-stone-100 p-2">
        <div className="grid grid-cols-2 gap-1 bg-stone-100 p-1" style={{ borderRadius: 8 }}>
          <TabButton active={tab === "groups"} onClick={() => setTab("groups")}>
            <Users className="h-3.5 w-3.5" />
            Groups ({selectedGroupIds.size})
          </TabButton>
          <TabButton active={tab === "contacts"} onClick={() => setTab("contacts")}>
            <UserRound className="h-3.5 w-3.5" />
            Contacts ({selectedContactIds.size})
          </TabButton>
        </div>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="text-field py-1.5 pl-8 text-xs"
          />
        </label>
      </div>

      <div className="max-h-64 overflow-y-auto p-2">
        {tab === "groups" ? (
          filteredGroups.length === 0 ? (
            <p className="py-4 text-center text-sm text-stone-500">No groups found.</p>
          ) : (
            filteredGroups.map((group) => (
              <label
                key={group._id}
                className="flex cursor-pointer items-center justify-between gap-3 px-2 py-2 hover:bg-teal-50"
                style={{ borderRadius: 8 }}
              >
                <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-stone-800">
                  <input
                    type="checkbox"
                    checked={selectedGroupIds.has(group._id)}
                    onChange={() => toggleGroup(group._id)}
                    className="h-4 w-4 rounded border-stone-300 text-teal-700 focus:ring-teal-600"
                  />
                  <span className="truncate">{group.name}</span>
                </span>
                <span className="shrink-0 text-xs text-stone-400">
                  {group.memberCount ?? 0} member{group.memberCount === 1 ? "" : "s"}
                </span>
              </label>
            ))
          )
        ) : filteredContacts.length === 0 ? (
          <p className="py-4 text-center text-sm text-stone-500">No contacts found.</p>
        ) : (
          filteredContacts.map((contact) => (
            <label
              key={contact._id}
              className="flex cursor-pointer items-center justify-between gap-3 px-2 py-2 hover:bg-teal-50"
              style={{ borderRadius: 8 }}
            >
              <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-stone-800">
                <input
                  type="checkbox"
                  checked={selectedContactIds.has(contact._id)}
                  onChange={() => toggleContact(contact._id)}
                  className="h-4 w-4 rounded border-stone-300 text-teal-700 focus:ring-teal-600"
                />
                <span className="truncate">{contact.name}</span>
              </span>
              <span className="truncate text-xs text-stone-400">{contact.email}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold transition ${
        active ? "bg-white text-teal-800 shadow-sm" : "text-stone-500 hover:text-stone-950"
      }`}
      style={{ borderRadius: 7 }}
    >
      {children}
    </button>
  );
}
