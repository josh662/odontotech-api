import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  ToolMessage,
} from '@langchain/core/messages';

export type TMessageType =
  | SystemMessage
  | HumanMessage
  | AIMessage
  | ToolMessage;

export type TOnMessageChunk = (
  chatId: string,
  from: 'user' | 'assistant',
  // messageChunk: TMessageType,
  messageChunk: any,
) => void;

export type TMessageProps = {
  kwargs: {
    id: string;
    content: string;
    tool_call_id?: string;
    tool_calls?: Array<Record<string, string>>;
  };
};

export type TMessageEventElement = {
  id: string;
  type: 'text' | 'tool_call' | 'tool_response';
  content: string;
};

export type TMessageEvent = {
  from: 'user' | 'assistant';
  elements: Array<TMessageEventElement>;
};
