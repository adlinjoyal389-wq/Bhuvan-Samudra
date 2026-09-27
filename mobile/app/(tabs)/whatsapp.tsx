import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ApiService } from '../../services/api';
import { StorageService } from '../../services/storage';

interface WhatsAppMsg {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function WhatsAppBotScreen() {
  const profile = StorageService.getUserProfile();
  const [messages, setMessages] = useState<WhatsAppMsg[]>([
    {
      id: '1',
      sender: 'bot',
      text:
        "🌊 *BHUVAN-SAMUDRA – TODAY'S UPDATE*\n\nGood morning, Amogh.\n\n⚓ *Sea Condition:* Moderate\n🌊 *Wave:* 1.4 m\n🌬 *Wind:* 12 km/h\n🐟 *Nearby PFZ:* 18 km northeast\n🔴 *IMBL Distance:* 8.4 km\n🛡 *Safety:* No immediate warning (Safe / Monitor)\n\n🤖 *ORCA Recommendation:*\n\"Current conditions are moderate. A potential fishing zone is available approximately 18 km northeast. Monitor wave conditions before travelling.\"\n\n📲 *Open App:* Bhuvan-Samudra for Satellite Map & Navigation",
      time: '10:30 AM',
    },
  ]);
  const [inputCommand, setInputCommand] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (cmdText: string) => {
    const cmd = cmdText.trim();
    if (!cmd) return;

    const userMsg: WhatsAppMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: cmd,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputCommand('');
    setLoading(true);

    try {
      const res = await ApiService.simulateWhatsApp(cmd, profile.mobile_number);
      const botMsg: WhatsAppMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.reply_text,
        time: res.sent_at || 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.warn("Failed to get WhatsApp reply", e);
    } finally {
      setLoading(false);
    }
  };

  const quickCommands = ['TODAY', 'PFZ', 'WEATHER', 'BORDER', 'ALERTS', 'HELP'];

  return (
    <View style={styles.container}>
      {/* WhatsApp Green Header */}
      <View style={styles.waHeader}>
        <View style={styles.waHeaderLeft}>
          <View style={styles.waAvatar}>
            <FontAwesome name="whatsapp" size={24} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.waNameRow}>
              <Text style={styles.waName}>Bhuvan-Samudra Bot</Text>
              <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
            </View>
            <Text style={styles.waStatus}>Official INCOIS-ORCA Gateway</Text>
          </View>
        </View>

        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>SHARED MEMORY</Text>
        </View>
      </View>

      {/* Simulator Notice */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={16} color="#047857" />
        <Text style={styles.infoBannerText}>
          Connected to the same backend database as the mobile app. Tap any command below:
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.chatScroll}
        contentContainerStyle={styles.chatPadding}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowBot]}
            >
              <View
                style={[
                  styles.msgBubble,
                  isUser ? styles.bubbleUser : styles.bubbleBot,
                ]}
              >
                <Text style={styles.msgText}>{msg.text}</Text>
                <View style={styles.msgFooter}>
                  <Text style={styles.timeText}>{msg.time}</Text>
                  {isUser && (
                    <Ionicons name="checkmark-done" size={14} color="#38BDF8" />
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {loading && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color="#059669" />
            <Text style={styles.loadingText}>Bhuvan-Samudra Bot is typing...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Command Pills */}
      <View style={styles.pillsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
          {quickCommands.map((cmd) => (
            <TouchableOpacity
              key={cmd}
              style={styles.pill}
              onPress={() => handleSend(cmd)}
            >
              <Text style={styles.pillText}>{cmd}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Send a command (e.g. TODAY, PFZ)..."
          placeholderTextColor="#94A3B8"
          value={inputCommand}
          onChangeText={setInputCommand}
          onSubmitEditing={() => handleSend(inputCommand)}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => handleSend(inputCommand)}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD', // Classic WhatsApp chat background
  },
  waHeader: {
    backgroundColor: '#075E54', // Official WhatsApp green
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#128C7E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  waName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  waStatus: {
    color: '#D1FAE5',
    fontSize: 11,
  },
  liveBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
  },
  infoBannerText: {
    fontSize: 11,
    color: '#065F46',
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatPadding: {
    padding: 14,
    gap: 12,
  },
  msgRow: {
    flexDirection: 'row',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowBot: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 10,
    ...THEME.shadow.card,
  },
  bubbleUser: {
    backgroundColor: '#E7FFDB', // WhatsApp sent green
    borderTopRightRadius: 2,
  },
  bubbleBot: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 2,
  },
  msgText: {
    fontSize: 13,
    color: '#111827',
    lineHeight: 18,
  },
  msgFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  loadingText: {
    fontSize: 12,
    color: '#059669',
  },
  pillsContainer: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pillsScroll: {
    paddingHorizontal: 12,
  },
  pill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#075E54',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F0F2F5',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
