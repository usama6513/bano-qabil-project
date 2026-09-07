'use client';

import { useEffect, useRef, useState, useMemo } from 'react';

interface Conversation {
  id: string;
  title: string;
  lastMessageAt?: string;
  isArchived?: boolean;
  createdAt?: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  archivedConversations?: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRename?: (id: string, title: string) => void;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSettings?: () => void;
  onDeleteAll?: () => void;
}

function groupByDate(conversations: Conversation[]): { label: string; items: Conversation[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, Conversation[]> = {
    'Today': [],
    'Yesterday': [],
    'Previous 7 Days': [],
    'Older': [],
  };

  for (const conv of conversations) {
    const date = conv.lastMessageAt ? new Date(conv.lastMessageAt) : new Date(conv.createdAt || Date.now());
    const convDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (convDate >= today) {
      groups['Today'].push(conv);
    } else if (convDate >= yesterday) {
      groups['Yesterday'].push(conv);
    } else if (convDate >= weekAgo) {
      groups['Previous 7 Days'].push(conv);
    } else {
      groups['Older'].push(conv);
    }
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

export default function ChatSidebar({
  conversations,
  archivedConversations = [],
  activeId,
  onSelect,
  onNew,
  onDelete,
  onArchive,
  onRename,
  onSearch,
  isLoading,
  isOpen,
  onClose,
  onSettings,
  onDeleteAll,
}: ChatSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [contextMenu, setContextMenu] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose();
        setContextMenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) => c.title.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  const grouped = useMemo(() => groupByDate(filteredConversations), [filteredConversations]);
  const archivedGrouped = useMemo(() => groupByDate(archivedConversations), [archivedConversations]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleRenameStart = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setContextMenu(null);
  };

  const handleRenameSubmit = (id: string) => {
    if (editTitle.trim()) {
      onRename?.(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={onClose} />
      )}

      <div
        ref={sidebarRef}
        className={`
          fixed md:relative z-50 md:z-auto
          w-72 h-full bg-[#0b1120] border-r border-[#1e293b]
          flex flex-col
          transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isOpen ? 'md:translate-x-0' : ''}
        `}
      >
        <div className="p-3 border-b border-[#1e293b] space-y-2">
          <button
            onClick={onNew}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
            aria-label="Start new chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>

          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-8 pr-3 py-1.5 text-sm text-white bg-[#0f172a] border border-[#1e293b] rounded-lg placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
              aria-label="Search conversations"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-[#334155] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredConversations.length === 0 && !showArchived ? (
            <div className="text-center py-8 text-sm text-gray-400">
              {searchQuery ? 'No matching conversations' : 'No conversations yet'}
            </div>
          ) : (
            <>
              {grouped.map((group) => (
                <div key={group.label} className="mb-3">
                  <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {group.label}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((conv) => (
                      <div
                        key={conv.id}
                        className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                          activeId === conv.id
                            ? 'bg-blue-500/10 text-blue-700'
                            : 'hover:bg-[#1e293b] text-gray-300'
                        }`}
                        onClick={() => {
                          onSelect(conv.id);
                          onClose();
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu(contextMenu === conv.id ? null : conv.id);
                        }}
                      >
                        <svg className="w-4 h-4 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>

                        {editingId === conv.id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleRenameSubmit(conv.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameSubmit(conv.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="flex-1 text-sm text-white bg-[#0f172a] border border-blue-300 rounded px-1 py-0.5 outline-none placeholder:text-slate-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Rename conversation"
                          />
                        ) : (
                          <span className="flex-1 truncate text-sm">{conv.title}</span>
                        )}

                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setContextMenu(contextMenu === conv.id ? null : conv.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#334155] text-gray-400 transition-all"
                            title="More options"
                            aria-label="Conversation options"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                            </svg>
                          </button>
                        </div>

                        {contextMenu === conv.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-40 bg-[#0f172a] border border-[#1e293b] rounded-lg shadow-lg py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameStart(conv);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-[#0b1120] flex items-center gap-2"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Rename
                            </button>
                            {onArchive && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onArchive(conv.id);
                                  setContextMenu(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-[#0b1120] flex items-center gap-2"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                Archive
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this conversation?')) {
                                  onDelete(conv.id);
                                }
                                setContextMenu(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-[#0b1120] text-red-600 flex items-center gap-2"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {archivedGrouped.length > 0 && (
            <div className="mt-4 border-t border-[#1e293b] pt-2">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="w-full px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-300 flex items-center gap-1"
                aria-label={showArchived ? 'Hide archived chats' : 'Show archived chats'}
              >
                <svg className={`w-3 h-3 transition-transform ${showArchived ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Archived Chats ({archivedConversations.length})
              </button>
              {showArchived && archivedGrouped.map((group) => (
                <div key={group.label} className="mt-1">
                  <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {group.label}
                  </div>
                  {group.items.map((conv) => (
                    <div
                      key={conv.id}
                      className="group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#1e293b] text-gray-400 text-sm"
                      onClick={() => {
                        onSelect(conv.id);
                        onClose();
                      }}
                    >
                      <svg className="w-4 h-4 flex-shrink-0 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      <span className="flex-1 truncate">{conv.title}</span>
                      {onArchive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchive(conv.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-xs text-blue-500 hover:text-blue-700"
                          title="Unarchive"
                          aria-label="Unarchive conversation"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-2 border-t border-[#1e293b] flex gap-1">
          {onSettings && (
            <button
              onClick={onSettings}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-300 hover:bg-[#1e293b] rounded-lg transition-colors"
              aria-label="Chat settings"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          )}
          {onDeleteAll && (
            <button
              onClick={onDeleteAll}
              className="flex items-center justify-center gap-1 px-3 py-2 text-xs text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
              aria-label="Delete all chats"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          )}
        </div>
      </div>
    </>
  );
}
