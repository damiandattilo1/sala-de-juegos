import { TestBed } from '@angular/core/testing';
import { GameDataService, HangmanResult, HigherLowerResult, TriviaResult, GeneralaResult, SurveyResult, ChatMessage } from './game-data.service';
import { HangmanResult as HangmanResultModel } from '../models/hangman-result.model';
import { HigherLowerResult as HigherLowerResultModel } from '../models/higher-lower-result.model';
import { TriviaResult as TriviaResultModel } from '../models/trivia-result.model';
import { GeneralaResult as GeneralaResultModel } from '../models/generala-result.model';
import { SurveyResult as SurveyResultModel } from '../models/survey-result.model';
import { ChatMessage as ChatMessageModel } from '../models/chat-message.model';

describe('GameDataService — re-exports and model shapes', () => {
  it('HangmanResult re-export matches model', () => {
    const result: HangmanResult = {} as HangmanResult;
    const modelResult: HangmanResultModel = result;
    expect(modelResult).toBeDefined();
  });

  it('HigherLowerResult re-export matches model', () => {
    const result: HigherLowerResult = {} as HigherLowerResult;
    const modelResult: HigherLowerResultModel = result;
    expect(modelResult).toBeDefined();
  });

  it('TriviaResult re-export matches model', () => {
    const result: TriviaResult = {} as TriviaResult;
    const modelResult: TriviaResultModel = result;
    expect(modelResult).toBeDefined();
  });

  it('GeneralaResult re-export matches model', () => {
    const result: GeneralaResult = {} as GeneralaResult;
    const modelResult: GeneralaResultModel = result;
    expect(modelResult).toBeDefined();
  });

  it('SurveyResult re-export matches model', () => {
    const result: SurveyResult = {} as SurveyResult;
    const modelResult: SurveyResultModel = result;
    expect(modelResult).toBeDefined();
  });

  it('ChatMessage re-export matches model', () => {
    const msg: ChatMessage = {} as ChatMessage;
    const modelMsg: ChatMessageModel = msg;
    expect(modelMsg).toBeDefined();
  });
});

describe('HangmanResult model shape', () => {
  it('should have required fields', () => {
    const result: HangmanResultModel = {
      uid: 'u1',
      email: 'a@b.com',
      nombre: 'Tester',
      palabra: 'ANGULAR',
      gano: true,
      tiempoSegundos: 30,
      letrasSeleccionadas: 8
    };
    expect(result.uid).toBe('u1');
    expect(result.gano).toBeTrue();
    expect(result.tiempoSegundos).toBe(30);
    expect(result.letrasSeleccionadas).toBe(8);
  });
});

describe('HigherLowerResult model shape', () => {
  it('should have required fields', () => {
    const result: HigherLowerResultModel = {
      uid: 'u2',
      email: 'b@c.com',
      nombre: 'Player',
      aciertos: 5,
      rondasJugadas: 7,
      gano: false
    };
    expect(result.aciertos).toBe(5);
    expect(result.rondasJugadas).toBe(7);
    expect(result.gano).toBeFalse();
  });
});

describe('TriviaResult model shape', () => {
  it('should have required fields', () => {
    const result: TriviaResultModel = {
      uid: 'u3',
      email: 'c@d.com',
      nombre: 'Quiz',
      aciertos: 8,
      totalPreguntas: 10,
      tiempoSegundos: 120
    };
    expect(result.aciertos).toBe(8);
    expect(result.totalPreguntas).toBe(10);
    expect(result.tiempoSegundos).toBe(120);
  });
});

describe('GeneralaResult model shape', () => {
  it('should have required fields', () => {
    const result: GeneralaResultModel = {
      uid: 'u4',
      email: 'd@e.com',
      nombre: 'Gen',
      puntosJugador: 15,
      puntosCpu: 10,
      rondasJugadas: 5,
      gano: true
    };
    expect(result.puntosJugador).toBe(15);
    expect(result.puntosCpu).toBe(10);
    expect(result.gano).toBeTrue();
  });
});

describe('ChatMessage model shape', () => {
  it('should have required fields', () => {
    const msg: ChatMessageModel = {
      id: 'msg1',
      uid: 'u5',
      email: 'e@f.com',
      nombre: 'Chat',
      mensaje: 'Hola',
      createdAt: null
    };
    expect(msg.id).toBe('msg1');
    expect(msg.mensaje).toBe('Hola');
    expect(msg.createdAt).toBeNull();
  });
});
