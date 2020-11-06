import { Injectable } from '@angular/core';
import { AnswerUtter, Dialog, QuestionIntent } from '../dialog.service';

export interface Intent {
  name: string;
  items: string[];
}



export interface Story {
  name: string;
  path: Array<IntentWithUtters>;
}

export interface Utter {
  name: string;
  items: string[];
}

export interface DialogFiles {
  intents: Intent[];
  stories: Story[];
  utters: Utter[];
}

export interface IntentWithUtters {
  intent: Intent;
  utters: Utter[];
}

function selectMany<TIn, TOut>(input: TIn[], selectListFn: (t: TIn) => TOut[]): TOut[] {
  return input.reduce((out, inx) => {
    out.push(...selectListFn(inx));
    return out;
  }, new Array<TOut>());
}

@Injectable({
  providedIn: 'root'
})
export class DialogGeneratorService {
  constructor() { }
  generate(dialogos: Dialog[]): DialogFiles {
    const stories = dialogos.map(dialogo => {
      return {
        name: dialogo.name,
        path: this.convertToIntentWithUttersArray(dialogo.items)
      } as Story;
    });
    return {
      
      intents: Array.from(new Set(selectMany(stories, (s) => s.path.map(a => (a.intent))).map((e) => JSON.stringify(e))) as any, (a, b) => JSON.parse(a as string)), // stories.flatMap(s => s.path.map(a => (a.intent))), // TODO
      stories,
      utters: Array.from(new Set(selectMany(stories, (s) => selectMany(s.path.map(a => (a.utters)), (a) => a)).map((e) => JSON.stringify(e))) as any, (a, b) => JSON.parse(a as string)), // TODO
    };
  }
  convertToIntentWithUttersArray(caminho: (AnswerUtter | QuestionIntent)[]): IntentWithUtters[] {


    // const result = caminho.reduce<IntentWithUtters[]>(((r, e)) => {
    //   const last = r[r.length - 1];
    //   if (e.check) r.push(e);
    //   else {
    //     if (!last || !('stack' in last)) r.push({ stack: [e] })
    //     else last.stack.push(e);
    //   }
    //   return r;
    // }, []);

    // caminho.reduce((acumulado, atual, indice) => {
    //   if (atual.type === 'QuestionIntent') {
    //     return { intent: { name: atual.id, items: [ atual.description ] }, utters: [] } as IntentWithUtters;
    //   } else if (atual.type === 'AnswerUtter') {
    //     intentWithUtters.utters.push({ name: atual.id, items: [ atual.description ] });
    //   }

    // });
    const intentsWithUtters = [] as IntentWithUtters[];
    let intentWithUtters = null as IntentWithUtters;
    caminho.forEach((dialogItem, index) => {
      // const descriptionSplitted = dialogItem.description.replace('- ', '').replace(/[\n\r]/g, '|').split('|- ').join('|').split('|');
      const descriptionSplittedWithEmpty = dialogItem.description.replace(/[\n\r]---[\n|\r]/g, '|').split('|');
      const descriptionSplitted = descriptionSplittedWithEmpty.filter(e => e !== '');
      if (dialogItem.type === 'QuestionIntent') {
        const novoIntentWithUtters = { intent: { name: dialogItem.id, items: descriptionSplitted }, utters: [] };
        intentWithUtters = novoIntentWithUtters;
        intentsWithUtters.push(intentWithUtters);
      } else if (dialogItem.type === 'AnswerUtter') {
        if (index === 0) {
          const novoIntentWithUtters = { intent: { name: dialogItem.id, items: descriptionSplitted }, utters: [] };
          intentWithUtters = novoIntentWithUtters;
          intentsWithUtters.push(intentWithUtters);
        }
        intentWithUtters.utters.push({ name: `utter_${dialogItem.id}`, items: descriptionSplitted });
      }
    });
    return intentsWithUtters;
  }
}
