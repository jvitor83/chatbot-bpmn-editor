import { Injectable } from '@angular/core';
import { of } from 'rxjs';

export interface DialogItem {
  id: string;
  description: string;
  underlyingItem?: any;
  type: 'QuestionIntent' | 'AnswerUtter';
}

export interface AnswerUtter extends DialogItem {
}

export interface QuestionIntent extends DialogItem {
}

export interface Dialog {
  id: string;
  name: string;
  items: Array<AnswerUtter | QuestionIntent>;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor() { }

  get() {
    return of([{
      id: '1dbf0b4f-8f44-4ad6-b9b3-f8cd9acfabde',
      name: 'Teste',
      items: [{
        id: '',
        name: '',
        description: 'Qual seu nome?',
        type: 'QuestionIntent',
        answers: [
          // 'Robô'
        ]
      } as QuestionIntent]
     } as Dialog]);
  }
}
