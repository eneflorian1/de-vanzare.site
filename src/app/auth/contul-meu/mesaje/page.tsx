'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, ArrowRight, RefreshCw, Mail, Search, Trash2, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  listingId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  deletedForSender?: boolean;
  deletedForReceiver?: boolean;
  sender: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  receiver: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  listing: {
    title: string;
    slug: string;
    images: {
      imageUrl: string;
      isPrimary: boolean;
    }[];
  };
}

export default function MessagesPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/login');
    },
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [deletingConversation, setDeletingConversation] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [contactsInfo, setContactsInfo] = useState<Record<number, { name: string, avatar: string | null }>>({});

  useEffect(() => {
    if (status !== 'loading') {
      setIsSessionLoading(false);
    }
  }, [status]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const [receivedResponse, sentResponse] = await Promise.all([
        fetch('/api/messages/primite'),
        fetch('/api/messages/trimise')
      ]);

      const receivedMessages = await receivedResponse.json();
      const sentMessages = await sentResponse.json();

      // Combinăm și sortăm toate mesajele după dată
      const allMessages = [...receivedMessages, ...sentMessages].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setMessages(allMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markMessagesAsRead = async (messages: Message[]) => {
    try {
      const unreadMessages = messages.filter(m => !m.isRead);
      await Promise.all(
        unreadMessages.map(message =>
          fetch(`/api/messages/${message.id}/read`, { method: 'PUT' })
        )
      );
      await fetchMessages(); // Reîncarcă mesajele pentru a actualiza statusul
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSelectContact = async (contactId: number) => {
    setSelectedContact(contactId);
    const contactMessages = messages.filter(
      m => m.senderId === contactId || m.receiverId === contactId
    );
    await markMessagesAsRead(contactMessages);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact || !session?.user) return;

    setSendingMessage(true);
    try {
      // Găsim toate mesajele pentru această conversație
      const conversationMessages = messages.filter(
        m => (m.senderId === selectedContact && m.receiverId === Number(session.user.id)) || 
            (m.senderId === Number(session.user.id) && m.receiverId === selectedContact)
      );

      // Verificăm dacă utilizatorul încearcă să își trimită mesaj sie însuși
      if (selectedContact === Number(session.user.id)) {
        throw new Error('Nu poți trimite mesaje către tine însuți');
      }

      // Verificăm dacă utilizatorul există
      const contactResponse = await fetch(`/api/users/${selectedContact}`);
      if (!contactResponse.ok) {
        throw new Error('Utilizatorul nu mai există sau nu poate primi mesaje');
      }

      // Găsim primul mesaj care are un listing ID valid
      const validMessage = conversationMessages.find(m => m.listingId);
      
      // Folosim listing ID-ul din conversație sau un ID fictiv (0) dacă anunțul nu mai există
      const listingIdToUse = validMessage?.listingId || 0;

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedContact,
          listingId: listingIdToUse,
          message: newMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la trimiterea mesajului');
      }

      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      // Adăugăm un alert pentru a arăta eroarea utilizatorului
      alert(error instanceof Error ? error.message : 'Eroare la trimiterea mesajului');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  };

  // Modificăm funcția de grupare a mesajelor pentru a evita conversațiile duplicate
  const groupedMessages = messages.reduce((groups, message) => {
    // Determinăm ID-ul contactului (celălalt utilizator din conversație)
    const contactId = message.senderId === Number(session?.user?.id) ? message.receiverId : message.senderId;
    
    if (!groups[contactId]) {
      groups[contactId] = [];
    }
    
    // Verificăm dacă mesajul nu este marcat ca șters pentru utilizatorul curent
    const isCurrentUserSender = message.senderId === Number(session?.user?.id);
    const isDeleted = isCurrentUserSender ? message.deletedForSender : message.deletedForReceiver;
    
    // Adăugăm mesajul doar dacă nu este șters pentru utilizatorul curent
    if (!isDeleted) {
      groups[contactId].push(message);
    }
    return groups;
  }, {} as Record<number, Message[]>);

  // Adăugăm o funcție pentru a încărca informațiile despre contacte
  const fetchContactsInfo = async () => {
    // Extragem ID-urile unice ale contactelor
    const uniqueContactIds = Array.from(new Set(
      messages.map(m => m.senderId === Number(session?.user?.id) ? m.receiverId : m.senderId)
    ));
    
    // Filtrăm ID-urile pentru care nu avem deja informații
    const contactsToFetch = uniqueContactIds.filter(id => !contactsInfo[id] && id !== Number(session?.user?.id));
    
    if (contactsToFetch.length === 0) return;
    
    // Încărcăm informațiile pentru fiecare contact
    const newContactsInfo = { ...contactsInfo };
    
    await Promise.all(contactsToFetch.map(async (contactId) => {
      try {
        const response = await fetch(`/api/users/${contactId}`);
        if (response.ok) {
          const userData = await response.json();
          if (userData.firstName || userData.lastName) {
            newContactsInfo[contactId] = {
              name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
              avatar: userData.avatar
            };
          }
        }
      } catch (error) {
        console.error(`Error fetching user ${contactId} info:`, error);
      }
    }));
    
    setContactsInfo(newContactsInfo);
  };

  // Încărcăm informațiile despre contacte când se încarcă mesajele
  useEffect(() => {
    if (messages.length > 0) {
      fetchContactsInfo();
    }
  }, [messages]);

  // Modificăm funcția de obținere a contactelor pentru a folosi informațiile din contactsInfo
  const contacts = Object.entries(groupedMessages).map(([contactIdStr, messages]) => {
    const contactId = Number(contactIdStr);
    const latestMessage = messages[0]; // Cel mai recent mesaj
    
    // Determinăm informațiile despre contact
    let contactInfo;
    if (contactId === Number(session?.user?.id)) {
      // Dacă contactul este utilizatorul curent (mesaj către sine)
      contactInfo = {
        id: contactId,
        name: 'Eu',
        avatar: session?.user?.image || null
      };
    } else {
      // Verificăm dacă avem informații în contactsInfo
      if (contactsInfo[contactId]) {
        contactInfo = {
          id: contactId,
          name: contactsInfo[contactId].name,
          avatar: contactsInfo[contactId].avatar
        };
      } else {
        // Găsim informațiile despre contact din mesaj
        const isUserSender = latestMessage.senderId === Number(session?.user?.id);
        const contact = isUserSender ? latestMessage.receiver : latestMessage.sender;
        
        if (!contact || (!contact.firstName && !contact.lastName)) {
          // Folosim ID-ul ca nume temporar
          contactInfo = {
            id: contactId,
            name: `Utilizator #${contactId}`,
            avatar: null
          };
        } else {
          contactInfo = {
            id: contactId,
            name: contact.firstName && contact.lastName 
              ? `${contact.firstName} ${contact.lastName}`
              : (contact.firstName || contact.lastName || `Utilizator #${contactId}`),
            avatar: contact.avatar
          };
        }
      }
    }
    
    return {
      ...contactInfo,
      lastMessage: latestMessage.message,
      lastMessageDate: new Date(latestMessage.createdAt),
      unreadCount: messages.filter(m => !m.isRead && m.receiverId === Number(session?.user?.id)).length
    };
  });

  // Filtrăm contactele în funcție de termenul de căutare
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adăugăm funcția de ștergere conversație
  const handleDeleteConversation = async (contactId: number) => {
    if (!confirm('Ești sigur că vrei să ștergi această conversație?')) {
      return;
    }

    setDeletingConversation(true);
    try {
      const response = await fetch(`/api/messages/conversation/${contactId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      // Resetăm contactul selectat și reîncărcăm mesajele
      setSelectedContact(null);
      await fetchMessages();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    } finally {
      setDeletingConversation(false);
    }
  };

  if (isSessionLoading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Modificăm și funcția de filtrare a mesajelor selectate pentru a exclude mesajele șterse
  const selectedMessages = messages
    .filter(m => {
      // Verificăm dacă mesajul face parte din conversația selectată
      const isPartOfConversation = m.senderId === selectedContact || m.receiverId === selectedContact;
      
      // Verificăm dacă mesajul nu este șters pentru utilizatorul curent
      const isCurrentUserSender = m.senderId === Number(session?.user?.id);
      const isDeleted = isCurrentUserSender ? m.deletedForSender : m.deletedForReceiver;
      
      // Includem mesajul doar dacă face parte din conversație și nu este șters
      return isPartOfConversation && !isDeleted;
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex h-[600px]">
        {/* Lista de contacte */}
        <div className="w-1/3 border-r">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Conversații</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className={`p-2 text-indigo-600 hover:bg-indigo-50 rounded-full ${
                  refreshing ? 'animate-spin' : ''
                }`}
              >
                <RefreshCw size={20} />
              </motion.button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Caută în conversații..."
                className="w-full px-4 py-2 bg-gray-50 border rounded-lg pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(600px-89px)]">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={40} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Nu ai nicio conversație încă</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  className={`p-4 cursor-pointer border-b ${
                    selectedContact === contact.id ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => handleSelectContact(contact.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {contact.avatar ? (
                        <Image
                          src={contact.avatar}
                          alt={contact.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                        {(contact.name || 'U')[0]}
                        </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-semibold truncate">
                          {contact.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(contact.lastMessageDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {contact.lastMessage}
                      </p>
                    </div>
                    {contact.unreadCount > 0 && (
                      <div className="ml-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {contact.unreadCount}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Conversație */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
                    {/* Selected contact header */}
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {selectedMessages[0]?.sender?.avatar ? (
                            <Image
                              src={selectedMessages[0].sender.avatar}
                              alt={selectedMessages[0].sender.firstName || 'Avatar utilizator'}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-semibold">
                                {(selectedMessages[0]?.sender?.firstName || 'U')[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold">
                              {selectedMessages[0]?.sender?.firstName
                                ? `${selectedMessages[0].sender.firstName} ${selectedMessages[0].sender.lastName || ''}`
                                : 'Utilizator necunoscut'}
                            </h3>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteConversation(selectedContact)}
                          disabled={deletingConversation}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Șterge conversația"
                        >
                          {deletingConversation ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </motion.button>
                      </div>
                    </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === selectedContact ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === selectedContact
                          ? 'bg-gray-100'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <div className="mt-1 flex justify-between items-center">
                        <Link 
                          href={`/anunturi/${message.listing?.slug || ''}`}
                          className={`text-xs ${message.listing?.slug ? 
                            (message.senderId === selectedContact
                              ? 'text-indigo-600'
                              : 'text-indigo-200')
                            : 'text-gray-400 cursor-not-allowed'}`}
                          onClick={(e) => {
                            if (!message.listing?.slug) {
                              e.preventDefault();
                            }
                          }}
                        >
                          {message.listing?.slug ? 'Vezi anunțul' : 'Anunț indisponibil'}
                        </Link>
                        {'_ '}
                        <span className="text-xs opacity-75">
                          
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <form onSubmit={handleSendMessage} className="flex space-x-2 w-full">
                    <input
                      type="text"
                      placeholder="Scrie un mesaj..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendingMessage}
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      disabled={sendingMessage || !newMessage.trim()}
                    >
                      {sendingMessage ? 'Se trimite...' : 'Trimite'}
                    </motion.button>
                  </form>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Selectează o conversație pentru a vedea mesajele</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}