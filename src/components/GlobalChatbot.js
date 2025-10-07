// components/GlobalChatbot.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAIResponse, needsDoctorAttention, getGlobalChatbotGreeting } from '../../services/aiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const GlobalChatbot = () => {
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [robotState, setRobotState] = useState('normal'); 
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  
  // Animation refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const eyeLookAnim = useRef(new Animated.Value(0)).current;
  const sleepBounceAnim = useRef(new Animated.Value(0)).current;
  const antennaAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  
  // Draggable position
  const pan = useRef(new Animated.ValueXY({ x: width - 84, y: height - 160 })).current;
  const [fabPosition, setFabPosition] = useState({ x: width - 84, y: height - 160 });

  // Timers
  const sleepTimerRef = useRef(null);
  const lookAroundTimerRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    loadMessages();
    startIdleAnimations();
    
    return () => {
      // Cleanup timers
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (lookAroundTimerRef.current) clearTimeout(lookAroundTimerRef.current);
    };
  }, []);

  // PanResponder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        updateInteraction();
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();
        
        const currentX = pan.x._value;
        const currentY = pan.y._value;
        
        // Snap to left or right side
        const screenMiddle = width / 2;
        const snapToRight = currentX > screenMiddle - 32;
        const targetX = snapToRight ? width - 84 : 20;
        
        // Keep Y within bounds
        const minY = 50;
        const maxY = height - 140;
        const boundedY = Math.max(minY, Math.min(maxY, currentY));
        
        // Animate to final position
        Animated.spring(pan, {
          toValue: { x: targetX, y: boundedY },
          useNativeDriver: false,
          tension: 50,
          friction: 7,
        }).start();
        
        setFabPosition({ x: targetX, y: boundedY });
      },
    })
  ).current;

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Track user interactions
  const updateInteraction = () => {
    setLastInteraction(Date.now());
    if (robotState === 'sleeping') {
      // Wake up the robot
      setRobotState('normal');
      // Reset animations
      Animated.parallel([
        Animated.timing(sleepBounceAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(eyeLookAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Restart idle timers
    startIdleAnimations();
  };

  // Build conversation context from recent messages
  const buildConversationContext = (currentMessages) => {
    const recentMessages = currentMessages.slice(-4); // Last 4 messages for context
    const context = recentMessages.map(msg => 
      `${msg.isFromUser ? 'User' : 'Assistant'}: ${msg.text}`
    ).join('\n');
    return context;
  };

  // Start idle behavior timers
  const startIdleAnimations = () => {
    // Clear existing timers
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (lookAroundTimerRef.current) clearTimeout(lookAroundTimerRef.current);

    // Start looking around randomly (only when awake)
    const scheduleRandomLook = () => {
      const randomDelay = Math.random() * 5000 + 3000; // 3-8 seconds
      lookAroundTimerRef.current = setTimeout(() => {
        if (robotState === 'normal' && !isVisible && !isTyping) {
          performRandomLook();
        }
        if (robotState !== 'sleeping') {
          scheduleRandomLook(); // Schedule next look only if not sleeping
        }
      }, randomDelay);
    };
    
    // Only schedule random looks if not sleeping
    if (robotState !== 'sleeping') {
      scheduleRandomLook();
    }

    // Sleep after 10 seconds of inactivity
    const scheduleSleep = () => {
      sleepTimerRef.current = setTimeout(() => {
        if (Date.now() - lastInteraction >= 10000 && !isVisible && !isTyping && robotState !== 'sleeping') {
          performSleep();
        }
      }, 10000);
    };
    scheduleSleep();
  };

  // Random look animation
  const performRandomLook = () => {
    if (robotState !== 'normal') return;
    
    const directions = [-1, 1]; // left, right
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    setRobotState(direction === -1 ? 'looking_left' : 'looking_right');
    
    Animated.sequence([
      Animated.timing(eyeLookAnim, {
        toValue: direction,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(1000 + Math.random() * 2000), // Look for 1-3 seconds
      Animated.timing(eyeLookAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (robotState === 'looking_left' || robotState === 'looking_right') {
        setRobotState('normal');
      }
    });
  };

  // Sleep animation
  const performSleep = () => {
    setRobotState('sleeping');
    
    // Gentle sleeping bounce animation
    const sleepLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sleepBounceAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sleepBounceAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    
    // Close eyes (make them very small)
    Animated.parallel([
      Animated.timing(blinkAnim, {
        toValue: 0.1,
        duration: 1000,
        useNativeDriver: true,
      }),
      sleepLoop,
    ]).start();
  };

  // Regular blinking animation (when awake)
  useEffect(() => {
    if (robotState === 'sleeping') return;
    
    const blinkInterval = setInterval(() => {
      if (robotState === 'normal' || robotState === 'thinking' || robotState.includes('looking')) {
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, 2000 + Math.random() * 3000); // Random blink interval

    return () => {
      if (blinkInterval) {
        clearInterval(blinkInterval);
      }
    };
  }, [robotState, blinkAnim]);

  // Robot antenna pulsing animation
  useEffect(() => {
    const antennaAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(antennaAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(antennaAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    antennaAnimation.start();
    
    return () => {
      if (antennaAnimation && antennaAnimation.stop) {
        antennaAnimation.stop();
      }
    };
  }, [antennaAnim]);

  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem('global_chatbot_messages');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        // Initialize with welcome message
        const welcomeMessage = {
          id: 'welcome_1',
          text: "Hello! 👋 I'm DENTA-BOT, your dental AI assistant. I can help answer questions about dental care, appointments, and services. How can I help you today?",
          time: getCurrentTime(),
          isFromUser: false,
          sender: 'DENTA-BOT',
          showButtons: true,
          buttons: [
            { text: "Dental Care Tips", value: "Give me dental care tips" },
            { text: "Services & Pricing", value: "What services do you offer?" },
            { text: "Emergency Help", value: "I have a dental emergency" },
            { text: "Book Appointment", value: "I want to book an appointment" }
          ]
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading chatbot messages:', error);
    }
  };

  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem('global_chatbot_messages', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving chatbot messages:', error);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleNavigateToAppointment = () => {
    updateInteraction();
    // Close the chatbot first
    setIsVisible(false);
    setIsMinimized(false);
    
    // Navigate to appointment screen
    navigation.navigate('AppointmentScreen');
  };

  const handleSend = async () => {
    const messageText = inputText.trim();
    if (messageText === '' || isTyping) return;

    updateInteraction();
    setInputText('');

    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      time: getCurrentTime(),
      isFromUser: true,
      sender: 'You',
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveMessages(newMessages);

    setIsTyping(true);
    setRobotState('thinking');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Build conversation context
      const conversationContext = buildConversationContext(newMessages);
      
      let aiResponse;
      if (needsDoctorAttention && needsDoctorAttention(messageText)) {
        aiResponse = "This sounds like something that needs immediate professional attention. Please call our clinic at 0917-817-4927 or visit us for urgent dental care.";
      } else {
        // Pass conversation context to AI
        aiResponse = await getAIResponse(messageText, 'global-chatbot', conversationContext);
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        time: getCurrentTime(),
        isFromUser: false,
        sender: 'DENTA-BOT',
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble responding right now. Please try again or call our clinic directly at 0917-817-4927.",
        time: getCurrentTime(),
        isFromUser: false,
        sender: 'DENTA-BOT',
      };
      
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
    } finally {
      setIsTyping(false);
      setRobotState('normal');
      updateInteraction();
    }
  };

  const handleButtonClick = async (buttonValue) => {
    updateInteraction();
    
    const userMessage = {
      id: Date.now().toString(),
      text: buttonValue,
      time: getCurrentTime(),
      isFromUser: true,
      sender: 'You',
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveMessages(newMessages);

    setIsTyping(true);
    setRobotState('thinking');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Build conversation context
      const conversationContext = buildConversationContext(newMessages);
      
      let aiResponse;
      let showBookButton = false;
      
      // Check if the user wants to book an appointment
      if (buttonValue === "I want to book an appointment") {
        aiResponse = "I'd be happy to help you book an appointment! 📅 Please call our clinic at 0917-817-4927 to schedule your visit. We're open Mon-Sat: 9AM-5PM, Sunday: 1PM-4PM. You can also click below to go to our appointment booking page.";
        showBookButton = true;
      } else {
        // Pass conversation context to AI
        aiResponse = await getAIResponse(buttonValue, 'global-chatbot', conversationContext);
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        time: getCurrentTime(),
        isFromUser: false,
        sender: 'DENTA-BOT',
        showButtons: showBookButton,
        buttons: showBookButton ? [
          { 
            text: "Book here", 
            value: "navigate_to_appointment",
            isNavigation: true 
          }
        ] : undefined
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble responding right now. Please try again or call our clinic directly at 0917-817-4927.",
        time: getCurrentTime(),
        isFromUser: false,
        sender: 'DENTA-BOT',
      };
      
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
    } finally {
      setIsTyping(false);
      setRobotState('normal');
      updateInteraction();
    }
  };

  const handleSpecialButtonClick = (button) => {
    if (button.isNavigation && button.value === "navigate_to_appointment") {
      handleNavigateToAppointment();
    } else {
      handleButtonClick(button.value);
    }
  };

  const toggleChatbot = () => {
    updateInteraction();
    
    if (isVisible) {
      // Closing chatbot
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
        setIsMinimized(false);
      });
    } else {
      // Opening chatbot
      setIsVisible(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
    Animated.timing(slideAnim, {
      toValue: 0.1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const maximizeChat = () => {
    updateInteraction();
    setIsMinimized(false);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const clearChat = async () => {
    updateInteraction();
    try {
      await AsyncStorage.removeItem('global_chatbot_messages');
      // Reload with welcome message using the greeting from aiService
      const greeting = getGlobalChatbotGreeting();
      const initialMessage = {
        id: 'welcome_1',
        text: greeting.message || "Hello! 👋 I'm DENTA-BOT, your dental AI assistant. How can I help you today?",
        time: getCurrentTime(),
        isFromUser: false,
        sender: 'DENTA-BOT',
        showButtons: greeting.showButtons,
        buttons: greeting.buttons
      };
      setMessages([initialMessage]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const renderButtons = (buttons) => (
    <View style={styles.buttonsContainer}>
      {buttons.map((button, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.quickButton,
            button.isNavigation && styles.navigationButton
          ]}
          onPress={() => handleSpecialButtonClick(button)}
        >
          <View style={styles.buttonContent}>
            {button.isNavigation && (
              <Ionicons 
                name="calendar-outline" 
                size={14} 
                color="#fff" 
                style={styles.buttonIcon} 
              />
            )}
            <Text style={styles.quickButtonText}>{button.text}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Enhanced Robot Avatar Component
  const RobotAvatar = ({ size = 28, showState = false }) => {
    const isCurrentlyTyping = showState ? isTyping : false;
    const currentState = showState ? robotState : 'normal';
    
    return (
      <View style={[styles.robotAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Robot Head */}
        <View style={styles.robotHead}>
          {/* Robot Eyes */}
          <View style={styles.robotEyesContainer}>
            <Animated.View 
              style={[
                styles.robotEye,
                {
                  transform: [
                    { 
                      scaleY: currentState === 'sleeping' ? 0.1 : (isCurrentlyTyping ? 0.3 : blinkAnim)
                    },
                    { 
                      translateX: eyeLookAnim.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: [-1, 0, 1]
                      })
                    }
                  ],
                  backgroundColor: isCurrentlyTyping ? '#FFD700' : 
                                 currentState === 'sleeping' ? '#90A4AE' : '#00BFFF'
                }
              ]}
            />
            <Animated.View 
              style={[
                styles.robotEye,
                {
                  transform: [
                    { 
                      scaleY: currentState === 'sleeping' ? 0.1 : (isCurrentlyTyping ? 0.3 : blinkAnim)
                    },
                    { 
                      translateX: eyeLookAnim.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: [-1, 0, 1]
                      })
                    }
                  ],
                  backgroundColor: isCurrentlyTyping ? '#FFD700' : 
                                 currentState === 'sleeping' ? '#90A4AE' : '#00BFFF'
                }
              ]}
            />
          </View>
          
          {/* Robot Mouth */}
          <Animated.View 
            style={[
              styles.robotMouth,
              {
                backgroundColor: isCurrentlyTyping ? '#FFD700' : 
                               currentState === 'sleeping' ? '#90A4AE' : '#00BFFF',
              }
            ]} 
          />
        </View>
        
        {/* Robot Antenna (only for larger avatars) */}
        {size > 25 && (
          <View style={styles.robotAntenna}>
            <View style={styles.robotAntennaLine} />
            <Animated.View 
              style={[
                styles.robotAntennaTip,
                {
                  opacity: currentState === 'sleeping' ? 0.3 : 
                          antennaAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1]
                          }),
                  transform: [{
                    scale: currentState === 'sleeping' ? 0.8 :
                           antennaAnim.interpolate({
                             inputRange: [0, 1],
                             outputRange: [0.8, 1.2]
                           })
                  }]
                }
              ]}
            />
          </View>
        )}
        
        {/* Sleep indicator (Z's) */}
        {currentState === 'sleeping' && size > 40 && (
          <View style={styles.sleepIndicator}>
            <Animated.Text 
              style={[
                styles.sleepZ,
                {
                  opacity: sleepBounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1]
                  }),
                  transform: [{
                    translateY: sleepBounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5]
                    })
                  }]
                }
              ]}
            >
              z
            </Animated.Text>
            <Animated.Text 
              style={[
                styles.sleepZ,
                styles.sleepZ2,
                {
                  opacity: sleepBounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 0.8]
                  }),
                  transform: [{
                    translateY: sleepBounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [2, -3]
                    })
                  }]
                }
              ]}
            >
              z
            </Animated.Text>
          </View>
        )}
      </View>
    );
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageRow,
      item.isFromUser ? styles.userRow : styles.botRow,
    ]}>
      {!item.isFromUser && (
        <RobotAvatar size={28} showState={false} />
      )}
      <View style={[
        styles.bubbleContainer,
        item.isFromUser ? styles.userBubble : styles.botBubble,
      ]}>
        {!item.isFromUser && (
          <Text style={styles.senderText}>{item.sender}</Text>
        )}
        <Text style={[
          styles.messageText,
          item.isFromUser ? styles.userMessageText : styles.botMessageText,
        ]}>
          {item.text}
        </Text>
        
        {item.showButtons && item.buttons && renderButtons(item.buttons)}
        
        <Text style={[
          styles.messageTime,
          item.isFromUser ? styles.userMessageTime : styles.botMessageTime,
        ]}>
          {item.time}
        </Text>
      </View>
      {item.isFromUser && (
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={16} color="#1E88E5" />
        </View>
      )}
    </View>
  );

  const renderTypingIndicator = () => (
    isTyping && (
      <View style={[styles.messageRow, styles.botRow]}>
        <RobotAvatar size={28} showState={false} />
        <View style={[styles.bubbleContainer, styles.botBubble]}>
          <Text style={styles.senderText}>DENTA-BOT</Text>
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>Thinking</Text>
            <ActivityIndicator size="small" color="#1E88E5" style={styles.typingSpinner} />
          </View>
        </View>
      </View>
    )
  );

  return (
    <>
      {/* Floating Robot Action Button - Draggable */}
      <Animated.View
        style={[
          styles.robotFab,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.robotFabButton}
          onPress={toggleChatbot}
          activeOpacity={0.8}
        >
          <Animated.View 
            style={[
              styles.robotFabContainer,
              {
                transform: [{
                  translateY: robotState === 'sleeping' ? 
                    sleepBounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 3]
                    }) : 0
                }]
              }
            ]}
          >
            {/* Enhanced Robot Head */}
            <View style={styles.fabRobotHead}>
              {/* Robot Eyes */}
              <View style={styles.fabRobotEyes}>
                <Animated.View 
                  style={[
                    styles.fabRobotEye,
                    {
                      transform: [
                        { 
                          scaleY: robotState === 'sleeping' ? 0.1 : blinkAnim 
                        },
                        { 
                          translateX: eyeLookAnim.interpolate({
                            inputRange: [-1, 0, 1],
                            outputRange: [-1.5, 0, 1.5]
                          })
                        }
                      ],
                      backgroundColor: robotState === 'sleeping' ? '#90A4AE' : '#E3F2FD'
                    }
                  ]}
                />
                <Animated.View 
                  style={[
                    styles.fabRobotEye,
                    {
                      transform: [
                        { 
                          scaleY: robotState === 'sleeping' ? 0.1 : blinkAnim 
                        },
                        { 
                          translateX: eyeLookAnim.interpolate({
                            inputRange: [-1, 0, 1],
                            outputRange: [-1.5, 0, 1.5]
                          })
                        }
                      ],
                      backgroundColor: robotState === 'sleeping' ? '#90A4AE' : '#E3F2FD'
                    }
                  ]}
                />
              </View>
              
              {/* Robot Mouth */}
              <Animated.View 
                style={[
                  styles.fabRobotMouth,
                  {
                    backgroundColor: robotState === 'sleeping' ? '#90A4AE' : '#E3F2FD',
                  }
                ]} 
              />
            </View>
            
            {/* Robot Antenna */}
            <View style={styles.fabRobotAntenna}>
              <View style={styles.fabAntennaLine} />
              <Animated.View 
                style={[
                  styles.fabAntennaTip,
                  {
                    opacity: robotState === 'sleeping' ? 0.3 :
                            antennaAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.1, 1]
                            }),
                    transform: [{
                      scale: robotState === 'sleeping' ? 0.8 :
                             antennaAnim.interpolate({
                               inputRange: [0, 1],
                               outputRange: [0.8, 1.2]
                             })
                    }]
                  }
                ]}
              />
            </View>
            
            {/* Sleep Z's */}
            {robotState === 'sleeping' && (
              <View style={styles.fabSleepIndicator}>
                <Animated.Text 
                  style={[
                    styles.fabSleepZ,
                    {
                      opacity: sleepBounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.4, 1]
                      }),
                      transform: [{
                        translateY: sleepBounceAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -8]
                        })
                      }]
                    }
                  ]}
                >
                  z
                </Animated.Text>
                <Animated.Text 
                  style={[
                    styles.fabSleepZ,
                    styles.fabSleepZ2,
                    {
                      opacity: sleepBounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 0.8]
                      }),
                      transform: [{
                        translateY: sleepBounceAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [3, -5]
                        })
                      }]
                    }
                  ]}
                >
                  z
                </Animated.Text>
              </View>
            )}
            
            {/* Notification Badge */}
            {!isVisible && messages.length > 1 && robotState !== 'sleeping' && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>!</Text>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Chat Modal */}
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.chatContainer,
              {
                // Position chat modal relative to FAB
                left: fabPosition.x > width / 2 ? undefined : 20,
                right: fabPosition.x > width / 2 ? 20 : undefined,
                bottom: height - fabPosition.y - 20,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 0.1, 1],
                    outputRange: [height, height * 0.7, 0],
                  })
                }],
                opacity: slideAnim.interpolate({
                  inputRange: [0, 0.1, 1],
                  outputRange: [0, 1, 1],
                })
              },
              isMinimized && styles.minimizedChat
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <RobotAvatar size={24} showState={true} />
                <Text style={styles.headerTitle}>DENTA-BOT</Text>
                <View style={[
                  styles.onlineIndicator,
                  robotState === 'sleeping' && styles.sleepingIndicator
                ]} />
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={clearChat}
                >
                  <Ionicons name="refresh-outline" size={18} color="#1E88E5" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={isMinimized ? maximizeChat : minimizeChat}
                >
                  <Ionicons 
                    name={isMinimized ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color="#1E88E5" 
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={toggleChatbot}
                >
                  <Ionicons name="close" size={18} color="#1E88E5" />
                </TouchableOpacity>
              </View>
            </View>

            {!isMinimized && (
              <>
                {/* Messages */}
                <KeyboardAvoidingView 
                  style={styles.messagesContainer}
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
                    ListFooterComponent={renderTypingIndicator}
                    showsVerticalScrollIndicator={false}
                  />

                  {/* Input */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Ask me anything about dental care..."
                        value={inputText}
                        onChangeText={(text) => {
                          setInputText(text);
                          updateInteraction();
                        }}
                        onFocus={updateInteraction}
                        multiline
                        placeholderTextColor="#90A4AE"
                        editable={!isTyping}
                        returnKeyType="send"
                        onSubmitEditing={handleSend}
                      />
                      <TouchableOpacity
                        style={[
                          styles.sendButton,
                          (inputText.trim() === '' || isTyping) && styles.sendButtonDisabled,
                        ]}
                        onPress={handleSend}
                        disabled={inputText.trim() === '' || isTyping}
                      >
                        <Ionicons name="send" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Robot FAB Styles
  robotFab: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  robotFabButton: {
    width: 64,
    height: 64,
  },
  robotFabContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#0D47A1',
  },
  fabRobotHead: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabRobotEyes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 16,
    marginBottom: 3,
  },
  fabRobotEye: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E3F2FD',
  },
  fabRobotMouth: {
    width: 8,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#E3F2FD',
  },
  fabRobotAntenna: {
    position: 'absolute',
    top: -8,
    alignItems: 'center',
  },
  fabAntennaLine: {
    width: 1,
    height: 6,
    backgroundColor: '#0D47A1',
  },
  fabAntennaTip: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00E5FF',
    marginTop: -1,
  },
  fabSleepIndicator: {
    position: 'absolute',
    top: -15,
    right: -10,
    alignItems: 'center',
  },
  fabSleepZ: {
    color: '#E3F2FD',
    fontSize: 12,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  fabSleepZ2: {
    fontSize: 10,
    position: 'absolute',
    right: -8,
    top: -3,
  },
  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF1744',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Robot Avatar Styles
  robotAvatar: {
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#1976D2',
    position: 'relative',
  },
  robotHead: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotEyesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 12,
    marginBottom: 2,
  },
  robotEye: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#00BFFF',
  },
  robotMouth: {
    width: 6,
    height: 1.5,
    borderRadius: 0.75,
    backgroundColor: '#00BFFF',
  },
  robotAntenna: {
    position: 'absolute',
    top: -6,
    alignItems: 'center',
  },
  robotAntennaLine: {
    width: 0.5,
    height: 4,
    backgroundColor: '#1976D2',
  },
  robotAntennaTip: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#00E5FF',
    marginTop: -0.5,
  },
  sleepIndicator: {
    position: 'absolute',
    top: -12,
    right: -8,
    alignItems: 'center',
  },
  sleepZ: {
    color: '#90A4AE',
    fontSize: 10,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  sleepZ2: {
    fontSize: 8,
    position: 'absolute',
    right: -6,
    top: -2,
  },

  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#1E88E5',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  chatContainer: {
    position: 'absolute',
    width: width - 40,
    maxWidth: 350,
    height: height * 0.6,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  minimizedChat: {
    height: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#F8FCFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
    marginLeft: 8,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  sleepingIndicator: {
    backgroundColor: '#FF9800',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 6,
    marginLeft: 4,
    borderRadius: 12,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    width: '100%',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  bubbleContainer: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userBubble: {
    backgroundColor: '#1976D2',
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#E3F2FD',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  senderText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '700',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#0D47A1',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  botMessageTime: {
    color: '#90A4AE',
  },
  buttonsContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  quickButton: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#0D47A1',
  },
  navigationButton: {
    backgroundColor: '#2E7D32',
    borderColor: '#1B5E20',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    color: '#1976D2',
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  typingSpinner: {
    marginLeft: 6,
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E3F2FD',
    backgroundColor: '#F8FCFF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    color: '#0D47A1',
    maxHeight: 100,
    minHeight: 36,
  },
  sendButton: {
    backgroundColor: '#1976D2',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#0D47A1',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default GlobalChatbot;