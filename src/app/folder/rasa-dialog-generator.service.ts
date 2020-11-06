import { Injectable } from '@angular/core';
import { Activity, Collaboration, Definitions, ExclusiveGateway, FlowElement, FlowNode, SendTask, SequenceFlow, StartEvent } from 'bpmn-moddle';
import { AnswerUtter, Dialog, QuestionIntent } from '../dialog.service';

@Injectable({
  providedIn: 'root'
})
export class RasaDialogGeneratorService {


  estrategia: 'um-caminho-por-intencao' | 'caminho-completo-dividido-por-decisao' | 'caminho-completo-sem-divisao' | 'caminho-completo-acumulativo' = 'caminho-completo-sem-divisao';

  constructor() { }

  generate(startEvent: StartEvent): Dialog[] {
    const dialogs = [] as Dialog[];

    this.recursiveCompletePath(startEvent, null, dialogs);

    return dialogs;
  }

  private arrayRemove(array: Array<unknown>, objeto: unknown) {
    const index = array.indexOf(objeto);
    if (index > -1) {
      array.splice(index, 1);
    }
  }

  recursiveCompletePath(elementoAtual: FlowElement, dialogo: Dialog, dialogos: Dialog[]) {
    // Se o elemento atual for o inicial
    if (elementoAtual.$type === 'bpmn:StartEvent') {
      // Ignoro o 'elemento inicial' e passa o proximo para ser tratado
      const sequence = (elementoAtual as SendTask).outgoing[0];
      dialogo = { id: sequence.id, name: sequence.id, items: [] } as Dialog;
      dialogos.push(dialogo);
      // Chama a recursao para que seja adicionado na proxima interacao
      const proximoElemento = sequence.targetRef;
      this.recursiveCompletePath(proximoElemento, dialogo, dialogos);
    } else if (elementoAtual.$type === 'bpmn:UserTask') {
      // Se for seta, devo adicionar
      // tslint:disable-next-line: max-line-length
      const intent = { id: elementoAtual.id, description: elementoAtual.documentation[0].text, type: 'QuestionIntent', underlyingItem: elementoAtual } as unknown as QuestionIntent;
      // Adiciono o dialogo anterior na lista e crio o novo
      this.adicionar(intent, dialogo);
      // Pego o elemento target e chamo o recursivo para trata-lo
      const proximoElemento = this.getNextElement(elementoAtual) as FlowNode;
      this.recursiveCompletePath(proximoElemento, dialogo, dialogos);
    } else if (elementoAtual.$type === 'bpmn:ServiceTask') {
      // tslint:disable-next-line: max-line-length
      const utter = { id: elementoAtual.id, description: elementoAtual.documentation[0].text, type: 'AnswerUtter', underlyingItem: elementoAtual } as unknown as AnswerUtter;
      this.adicionar(utter, dialogo);
      const proximoElemento = this.getNextElement(elementoAtual) as FlowNode;
      this.recursiveCompletePath(proximoElemento, dialogo, dialogos);
    } else if (elementoAtual.$type === 'bpmn:EndEvent') {
      // Nada por enquanto
    } else if (elementoAtual.$type === 'bpmn:ExclusiveGateway') {
      // tslint:disable-next-line: max-line-length
      const elementosDestino = (elementoAtual as ExclusiveGateway).outgoing;
      // Para cada elemento de destino da descição/escolha
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < elementosDestino.length; index++) {
        // Devo chamar a recursao para que adicione o sequence/seta como intent
        const sequence = elementosDestino[index];
        // Se a estrategia for de criar um caminho
        if (this.estrategia === 'caminho-completo-dividido-por-decisao' || this.estrategia === 'caminho-completo-sem-divisao' || this.estrategia === 'caminho-completo-acumulativo') {
          // Devo clonar o caminho atual
          const caminhoClonado = JSON.parse(JSON.stringify(dialogo)) as Dialog;
          // adicionar na lista dos caminhos
          dialogos.push(caminhoClonado);
          // passar para a recursao continuar montando o caminho
          const proximoSequenceElement = sequence.targetRef;
          caminhoClonado.id = proximoSequenceElement.id;
          caminhoClonado.name = proximoSequenceElement.id;
          if (this.estrategia === 'caminho-completo-sem-divisao') {
            this.arrayRemove(dialogos, dialogo);
          }
          this.recursiveCompletePath(proximoSequenceElement, caminhoClonado, dialogos);
          if (this.estrategia === 'caminho-completo-acumulativo') {
            // Crio novo dialogo
            const dialogoNovo = { id: caminhoClonado.id + '_' + index, name: caminhoClonado.name + '_' + index, items: [] } as Dialog;
            dialogos.push(dialogoNovo);
            // Passo para a recursao continuar montando o caminho
            this.recursiveCompletePath(proximoSequenceElement, dialogoNovo, dialogos);
          }
        } else if (this.estrategia === 'um-caminho-por-intencao') {
          dialogo = { id: sequence.id, name: sequence.id, items: [] } as Dialog;
          dialogos.push(dialogo);
          const proximoSequenceElement = sequence.targetRef;
          this.recursiveCompletePath(proximoSequenceElement, dialogo, dialogos);
        }
      }
    } else {
      const proximoElemento = this.getNextElement(elementoAtual) as FlowNode;
      this.recursiveCompletePath(proximoElemento, dialogo, dialogos);
    }
  }
  getNextElement(elementoAtual: FlowElement): FlowNode {
    if ((elementoAtual as FlowNode).outgoing) {
      return (elementoAtual as SendTask).outgoing[0].targetRef;
    } else {
      const definitionElement = elementoAtual.$parent.$parent as Definitions;
      const collaborations = definitionElement.rootElements.filter(r => r.$type === 'bpmn:Collaboration');
      const collaboration = collaborations[0] as Collaboration;
      const flowArray = collaboration.messageFlows.filter(m => (m.sourceRef as unknown as FlowNode).id === elementoAtual.id);
      const flow = flowArray[0];
      const target = flow.targetRef;
      return target as unknown as FlowNode;
    }
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
