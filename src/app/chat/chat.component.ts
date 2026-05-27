import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from 'firebase/auth';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { GameDataService } from '../services/game-data.service';
import { ChatMessage } from '../models/chat-message.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatBody') chatBody?: ElementRef<HTMLDivElement>;

  user: User | null = null;
  userName = 'Jugador';

  messages: ChatMessage[] = [];
  messageText = '';
  loading = true;
  error = '';

  private shouldAutoScroll = true;
  private userSub?: Subscription;
  private chatUnsubscribe?: () => void;

  constructor(
    private readonly authService: AuthService,
    private readonly gameDataService: GameDataService
  ) {}

  async ngOnInit(): Promise<void> {
    this.userSub = this.authService.currentUser$.subscribe(async (user) => {
      this.user = user;
      if (user) {
        this.userName = await this.authService.getNombreUsuario(user.uid);
      } else {
        this.userName = 'Jugador';
      }
    });

    this.chatUnsubscribe = this.gameDataService.subscribeChatMessages(
      (messages) => {
        this.messages = messages;
        this.loading = false;
        this.shouldAutoScroll = true;
      },
      (errorMessage) => {
        this.loading = false;
        this.error = `No se pudo cargar el chat: ${errorMessage}`;
      }
    );
  }

  ngAfterViewChecked(): void {
    if (this.shouldAutoScroll) {
      this.scrollToBottom();
      this.shouldAutoScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.chatUnsubscribe?.();
  }

  async sendMessage(): Promise<void> {
    const trimmed = this.messageText.trim();
    if (!trimmed || !this.user) {
      return;
    }

    await this.gameDataService.sendChatMessage(
      this.user.uid,
      this.user.email ?? '',
      this.userName || 'Jugador',
      trimmed
    );

    this.messageText = '';
  }

  isOwnMessage(message: ChatMessage): boolean {
    return this.user?.uid === message.uid;
  }

  formatTime(date: Date | null): string {
    if (!date) {
      return '--:--';
    }
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    const container = this.chatBody?.nativeElement;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }
}
