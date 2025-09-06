import React, { useState, useEffect, useRef } from 'react';
import { db } from '../App';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs, doc, setDoc, orderBy, getDoc } from 'firebase/firestore';
import { Send, ArrowLeft, PlusCircle } from 'lucide-react';
import { Spinner } from './Shared';
import UserSelectionModal from './UserSelectionModal';

const ChatPage = ({ currentUser, chatTarget, setChatTarget }) => {
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch user's conversations
    useEffect(() => {
        if (!currentUser) return;
        setLoading(true);
        const q = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid), orderBy('lastMessageAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setConversations(convos);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    // Function to get or create a chat with a target user
    const getOrCreateChat = async (targetUser) => {
        if (!currentUser || !targetUser) return;
        
        const chatId = [currentUser.uid, targetUser.id].sort().join('_');
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
            const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const currentUserName = currentUserDoc.data()?.name || currentUser.email;

            await setDoc(chatRef, {
                id: chatId,
                participants: [currentUser.uid, targetUser.id],
                participantNames: {
                    [currentUser.uid]: currentUserName,
                    [targetUser.id]: targetUser.name
                },
                lastMessage: '',
                lastMessageAt: serverTimestamp()
            });
        }
        setActiveChat({ id: chatId, otherUserName: targetUser.name });
        setChatTarget(null); // Clear direct target from props
    };

    // Set active chat if a target is passed from another page
    useEffect(() => {
        if (chatTarget && currentUser) {
            getOrCreateChat(chatTarget);
        }
    }, [chatTarget, currentUser]);

    // Fetch messages for the active chat
    useEffect(() => {
        if (!activeChat) return;
        const messagesRef = collection(db, 'chats', activeChat.id, 'messages');
        const q = query(messagesRef, orderBy('createdAt'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => doc.data()));
        });
        return () => unsubscribe();
    }, [activeChat]);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;
        const messagesRef = collection(db, 'chats', activeChat.id, 'messages');
        await addDoc(messagesRef, {
            text: newMessage,
            senderId: currentUser.uid,
            createdAt: serverTimestamp()
        });
        await setDoc(doc(db, 'chats', activeChat.id), {
            lastMessage: newMessage,
            lastMessageAt: serverTimestamp()
        }, { merge: true });
        setNewMessage('');
    };

    const selectConversation = (convo) => {
        const otherUserId = convo.participants.find(p => p !== currentUser.uid);
        setActiveChat({ id: convo.id, otherUserName: convo.participantNames[otherUserId] });
        setChatTarget(null);
    };

    const handleUserSelect = (targetUser) => {
        getOrCreateChat(targetUser);
        setIsUserModalOpen(false);
    };
    
    if (loading) return <Spinner />;

    return (
        <>
            <div className="flex h-[75vh] max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Conversation List */}
                <div className={`w-full md:w-1/3 border-r border-slate-200 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="font-semibold text-lg">Conversations</h2>
                        <button onClick={() => setIsUserModalOpen(true)} className="flex items-center gap-1 text-sm text-teal-600 font-semibold p-2 rounded-lg hover:bg-teal-50">
                            <PlusCircle size={18} /> New Chat
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {conversations.map(convo => (
                            <div key={convo.id} onClick={() => selectConversation(convo)} className={`p-4 cursor-pointer border-b ${activeChat?.id === convo.id ? 'bg-teal-50' : 'hover:bg-slate-50'}`}>
                                <p className="font-semibold">{convo.participantNames[convo.participants.find(p => p !== currentUser.uid)]}</p>
                                <p className="text-sm text-slate-500 truncate">{convo.lastMessage}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Message Area */}
                <div className={`w-full md:w-2/3 flex flex-col ${activeChat ? 'flex' : 'hidden md:flex'}`}>
                    {activeChat ? (
                        <>
                            <div className="p-4 border-b flex items-center gap-3">
                                <button onClick={() => setActiveChat(null)} className="md:hidden p-1 rounded-full hover:bg-slate-100"><ArrowLeft size={20}/></button>
                                <h2 className="font-semibold text-lg">{activeChat.otherUserName}</h2>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto bg-slate-50">
                                {messages.map((msg, index) => (
                                    <div key={index} className={`flex mb-3 ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`py-2 px-4 rounded-2xl max-w-xs lg:max-w-md ${msg.senderId === currentUser.uid ? 'bg-teal-500 text-white' : 'bg-slate-200'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                <button type="submit" className="bg-teal-500 text-white rounded-full p-3 hover:bg-teal-600"><Send /></button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-slate-500">
                            <p>Select a conversation or start a new one.</p>
                        </div>
                    )}
                </div>
            </div>
            <UserSelectionModal 
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSelect={handleUserSelect}
                currentUserId={currentUser?.uid}
            />
        </>
    );
};
export default ChatPage;
