export interface Question {
  question: string;
  que_category: string;
  percentage: number;
}

export interface CareerSession {
  sessionid: string;
  topic: string;
  division: string;
  subdivision: string;
  thumbfile: string;
}

export interface Career {
  session: CareerSession;
  questions: Question[];
}

export interface CareerApiResponse {
  success: number;
  message: string;
  data: Career[];
}