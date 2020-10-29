import { Injectable } from '@angular/core';
import { Activity, ExclusiveGateway, FlowElement, FlowNode, SequenceFlow, StartEvent } from 'bpmn-moddle';
import { AnswerUtter, Dialog, QuestionIntent } from '../dialog.service';

@Injectable({
  providedIn: 'root'
})
export class RasaDialogGeneratorService {

  constructor() { }

  generate(startEvent: StartEvent): Dialog[] {
    const dialogs = [] as Dialog[];

    this.recursive(startEvent, null, dialogs);

    return dialogs;
  }

  recursive(elementoAtual: FlowElement, dialogo: Dialog, dialogos: Dialog[]) {
    // Se o elemento atual for o inicial
    if (elementoAtual.$type === 'bpmn:StartEvent') {
      // Ignoro o 'elemento inicial' e uso o seu SequenceFlow (seta)
      const elementoSeta = (elementoAtual as StartEvent).outgoing[0] as SequenceFlow;
      // Chama a recursao para que seja adicionado na proxima interacao
      this.recursive(elementoSeta, dialogo, dialogos);
    } else if (elementoAtual.$type === 'bpmn:SequenceFlow') {
      // Se for seta, devo adicionar
      // tslint:disable-next-line: max-line-length
      const intent = { id: elementoAtual.id, description: elementoAtual.name, type: 'QuestionIntent', underlyingItem: elementoAtual } as unknown as QuestionIntent;
      // Adiciono o dialogo anterior na lista e crio o novo
      if (dialogo) {
        dialogos.push(dialogo);
      }
      const novoDialogo = { id: elementoAtual.id, name: elementoAtual.id, items: [] } as Dialog;
      this.adicionar(intent, novoDialogo);
      // Pego o elemento target e chamo o recursivo para trata-lo
      const elementoDestino = (elementoAtual as SequenceFlow).targetRef;
      this.recursive(elementoDestino, novoDialogo, dialogos);
    } else if (elementoAtual.$type === 'bpmn:Task') {
      // tslint:disable-next-line: max-line-length
      const utter = { id: elementoAtual.id, description: elementoAtual.name, type: 'AnswerUtter', underlyingItem: elementoAtual } as unknown as AnswerUtter;
      this.adicionar(utter, dialogo);
      const elementoDestino = (elementoAtual as Activity).outgoing[0].targetRef;
      this.recursive(elementoDestino, dialogo, dialogos);
    } else if (elementoAtual.$type === 'bpmn:EndEvent') {
      // tslint:disable-next-line: max-line-length
      dialogos.push(dialogo);
    } else if (elementoAtual.$type === 'bpmn:ExclusiveGateway') {
      // tslint:disable-next-line: max-line-length
      const utter = { id: elementoAtual.id, description: elementoAtual.name, type: 'AnswerUtter', underlyingItem: elementoAtual } as unknown as AnswerUtter;
      this.adicionar(utter, dialogo);
      const elementosDestino = (elementoAtual as ExclusiveGateway).outgoing;
      // Para cada elemento de destino da descição/escolha
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < elementosDestino.length; index++) {
        // Devo chamar a recursao para que adicione o sequence/seta como intent
        const proximoSequenceElement = elementosDestino[index];
        this.recursive(proximoSequenceElement, dialogo, dialogos);
      }
    }
  }
  adicionar(item: QuestionIntent | AnswerUtter, dialogo: Dialog) {
    dialogo.items.push(item);
  }
}
