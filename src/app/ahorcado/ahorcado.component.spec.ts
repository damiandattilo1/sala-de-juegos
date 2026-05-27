import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { AhorcadoComponent } from './ahorcado.component';
import { AuthService } from '../auth.service';
import { GameDataService } from '../services/game-data.service';

describe('AhorcadoComponent', () => {
  let component: AhorcadoComponent;
  let fixture: ComponentFixture<AhorcadoComponent>;

  const authState$ = new BehaviorSubject<any>(null);
  const authMock = {
    currentUser$: authState$,
    getNombreUsuario: jasmine.createSpy('getNombreUsuario').and.resolveTo('Tester')
  };
  const gameDataMock = {
    saveHangmanResult: jasmine.createSpy('saveHangmanResult').and.resolveTo(undefined)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AhorcadoComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: GameDataService, useValue: gameDataMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AhorcadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with a secret word from the internal word list', () => {
    expect(component.secretWord.length).toBeGreaterThan(0);
    expect(component.secretWord).toMatch(/^[A-ZÁÉÍÓÚ]+$/);
  });

  it('should initialize with zero wrong attempts', () => {
    expect(component.wrongAttempts).toBe(0);
  });

  it('should have maxErrors = 6', () => {
    expect(component.maxErrors).toBe(6);
  });

  it('should compute remainingAttempts correctly', () => {
    expect(component.remainingAttempts).toBe(6);
    component.wrongAttempts = 2;
    expect(component.remainingAttempts).toBe(4);
  });

  it('maskedWord should mask unselected letters', () => {
    component.secretWord = 'ANGULAR';
    component.selectedLetters = new Set<string>();
    expect(component.maskedWord).toBe('_ _ _ _ _ _ _');
  });

  it('maskedWord should reveal selected letters', () => {
    component.secretWord = 'ANGULAR';
    component.selectedLetters = new Set(['A', 'R']);
    const masked = component.maskedWord;
    expect(masked).toContain('A');
    expect(masked).toContain('R');
    expect(masked).not.toContain('N');
  });

  it('isLetterUsed returns true for already selected letters', () => {
    component.selectedLetters = new Set(['A']);
    expect(component.isLetterUsed('A')).toBeTrue();
    expect(component.isLetterUsed('Z')).toBeFalse();
  });

  it('isLetterUsed returns true for all letters when game is finished', () => {
    component.gameFinished = true;
    expect(component.isLetterUsed('Z')).toBeTrue();
  });

  it('selectLetter should not act when game is finished', fakeAsync(async () => {
    component.secretWord = 'ANGULAR';
    component.gameFinished = true;
    const prevSize = component.selectedLetters.size;
    await component.selectLetter('A');
    tick();
    expect(component.selectedLetters.size).toBe(prevSize);
  }));

  it('selectLetter should not act on already selected letter', fakeAsync(async () => {
    component.secretWord = 'ANGULAR';
    component.selectedLetters = new Set(['A']);
    await component.selectLetter('A');
    tick();
    expect(component.wrongAttempts).toBe(0);
  }));

  it('selectLetter increments wrongAttempts for a wrong letter', fakeAsync(async () => {
    component.secretWord = 'ANGULAR';
    await component.selectLetter('Z');
    tick();
    expect(component.wrongAttempts).toBe(1);
  }));

  it('selectLetter does NOT increment wrongAttempts for a correct letter', fakeAsync(async () => {
    component.secretWord = 'ANGULAR';
    await component.selectLetter('A');
    tick();
    expect(component.wrongAttempts).toBe(0);
  }));

  it('game is won when all letters are guessed', fakeAsync(async () => {
    component.secretWord = 'AB';
    component.selectedLetters = new Set<string>();
    component.wrongAttempts = 0;
    await component.selectLetter('A');
    tick();
    await component.selectLetter('B');
    tick();
    expect(component.won).toBeTrue();
    expect(component.gameFinished).toBeTrue();
    expect(component.statusMessage).toContain('Adivinaste');
  }));

  it('game is lost when wrongAttempts reaches maxErrors', fakeAsync(async () => {
    component.secretWord = 'A';
    component.selectedLetters = new Set<string>();
    component.wrongAttempts = 0;
    for (const letter of ['Z', 'X', 'Q', 'W', 'K', 'V']) {
      await component.selectLetter(letter);
      tick();
    }
    expect(component.won).toBeFalse();
    expect(component.gameFinished).toBeTrue();
    expect(component.statusMessage).toContain('La palabra era');
  }));

  it('startNewGame resets state', () => {
    component.secretWord = 'TEST';
    component.wrongAttempts = 3;
    component.gameFinished = true;
    component.won = true;
    component.statusMessage = 'old';
    component.selectedLetters = new Set(['A', 'B']);

    component.startNewGame();

    expect(component.wrongAttempts).toBe(0);
    expect(component.gameFinished).toBeFalse();
    expect(component.won).toBeFalse();
    expect(component.statusMessage).toBe('');
    expect(component.selectedLetters.size).toBe(0);
    expect(component.secretWord.length).toBeGreaterThan(0);
  });

  it('should save result when user is logged in and game ends (win)', fakeAsync(async () => {
    authState$.next({ uid: 'u1', email: 'test@test.com' });
    tick();
    fixture.detectChanges();
    await fixture.whenStable();

    component.secretWord = 'AB';
    component.selectedLetters = new Set<string>();
    component.wrongAttempts = 0;

    await component.selectLetter('A');
    tick();
    await component.selectLetter('B');
    tick();

    expect(gameDataMock.saveHangmanResult).toHaveBeenCalled();
    const call = gameDataMock.saveHangmanResult.calls.mostRecent().args[0];
    expect(call.gano).toBeTrue();
    expect(call.uid).toBe('u1');
  }));

  it('alphabet should have 26 letters', () => {
    expect(component.alphabet.length).toBe(26);
    expect(component.alphabet[0]).toBe('A');
    expect(component.alphabet[25]).toBe('Z');
  });

  it('should render the SVG hangman drawing', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hangman-drawing')).toBeTruthy();
    expect(compiled.querySelector('svg')).toBeTruthy();
  });
});
