import { GeneratedQuestion } from '@shared/schema';

export interface FileHistoryItem {
  id: string;
  filename: string;
  timestamp: number;
  question: GeneratedQuestion;
  subject?: string;
  topic?: string;
  difficulty?: string;
}

export class FileHistoryManager {
  private static readonly HISTORY_INDEX_KEY = 'file_history_index';

  /**
   * Lưu một câu hỏi vào file riêng biệt
   */
  static async saveQuestionToFile(
    question: GeneratedQuestion, 
    metadata?: {
      subject?: string;
      topic?: string;
      difficulty?: string;
    }
  ): Promise<string> {
    const timestamp = Date.now();
    const id = this.generateId();
    const filename = `question_${id}.txt`;
    
    // Tạo nội dung text dễ đọc
    const fileContent = this.formatQuestionAsText(question, metadata, timestamp);

    // Tạo file trong thư mục history
    const blob = new Blob([fileContent], { 
      type: 'text/plain; charset=utf-8' 
    });
    
    // Tạo link download để lưu file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Lưu thông tin vào index
    const historyItem: FileHistoryItem = {
      id,
      filename,
      timestamp,
      question,
      subject: metadata?.subject,
      topic: metadata?.topic,
      difficulty: metadata?.difficulty
    };

    this.addToIndex(historyItem);
    
    return id;
  }

  /**
   * Lưu nhiều câu hỏi vào các file riêng biệt
   */
  static async saveQuestionsToFiles(
    questions: GeneratedQuestion[],
    metadata?: {
      subject?: string;
      topic?: string;
      difficulty?: string;
    }
  ): Promise<string[]> {
    const ids: string[] = [];
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const id = await this.saveQuestionToFile(question, {
        ...metadata,
        // Thêm số thứ tự vào topic nếu có nhiều câu hỏi
        topic: questions.length > 1 
          ? `${metadata?.topic || 'Câu hỏi'} - Câu ${i + 1}/${questions.length}`
          : metadata?.topic
      });
      ids.push(id);
    }
    
    return ids;
  }

  /**
   * Thêm item vào index
   */
  private static addToIndex(item: FileHistoryItem): void {
    const index = this.getIndex();
    index.unshift(item); // Thêm vào đầu danh sách

    // Giới hạn số lượng (tối đa 1000 file)
    if (index.length > 1000) {
      index.splice(1000);
    }

    localStorage.setItem(this.HISTORY_INDEX_KEY, JSON.stringify(index));
  }

  /**
   * Lấy danh sách index của các file
   */
  static getIndex(): FileHistoryItem[] {
    try {
      const index = localStorage.getItem(this.HISTORY_INDEX_KEY);
      return index ? JSON.parse(index) : [];
    } catch (error) {
      console.error('Lỗi khi đọc index lịch sử:', error);
      return [];
    }
  }

  /**
   * Tìm kiếm trong index
   */
  static searchIndex(query: string): FileHistoryItem[] {
    const index = this.getIndex();
    const lowerQuery = query.toLowerCase();

    return index.filter(item => {
      const searchableText = [
        item.subject || '',
        item.topic || '',
        item.question.question,
        ...(item.question.options || [])
      ].join(' ').toLowerCase();

      return searchableText.includes(lowerQuery);
    });
  }

  /**
   * Lọc theo subject
   */
  static filterBySubject(subject: string): FileHistoryItem[] {
    const index = this.getIndex();
    return index.filter(item => item.subject === subject);
  }

  /**
   * Lọc theo độ khó
   */
  static filterByDifficulty(difficulty: string): FileHistoryItem[] {
    const index = this.getIndex();
    return index.filter(item => item.difficulty === difficulty);
  }

  /**
   * Xóa một item khỏi index
   */
  static deleteFromIndex(id: string): boolean {
    const index = this.getIndex();
    const newIndex = index.filter(item => item.id !== id);
    
    if (newIndex.length !== index.length) {
      localStorage.setItem(this.HISTORY_INDEX_KEY, JSON.stringify(newIndex));
      return true;
    }
    
    return false;
  }

  /**
   * Xóa toàn bộ index
   */
  static clearIndex(): void {
    localStorage.removeItem(this.HISTORY_INDEX_KEY);
  }

  /**
   * Lấy thống kê
   */
  static getStats(): {
    totalFiles: number;
    subjects: { [key: string]: number };
    difficulties: { [key: string]: number };
    recentFiles: FileHistoryItem[];
  } {
    const index = this.getIndex();
    
    const subjects: { [key: string]: number } = {};
    const difficulties: { [key: string]: number } = {};
    
    index.forEach(item => {
      if (item.subject) {
        subjects[item.subject] = (subjects[item.subject] || 0) + 1;
      }
      if (item.difficulty) {
        difficulties[item.difficulty] = (difficulties[item.difficulty] || 0) + 1;
      }
    });

    return {
      totalFiles: index.length,
      subjects,
      difficulties,
      recentFiles: index.slice(0, 20) // 20 file gần nhất
    };
  }

  /**
   * Xuất danh sách index
   */
  static exportIndex(): string {
    const index = this.getIndex();
    return JSON.stringify(index, null, 2);
  }

  /**
   * Tạo ID duy nhất
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Format thời gian hiển thị
   */
  static formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hôm nay ' + date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'Hôm qua ' + date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  }

  /**
   * Tạo tên file từ nội dung câu hỏi
   */
  static generateFilename(question: GeneratedQuestion, index?: number): string {
    // Lấy 50 ký tự đầu của câu hỏi, loại bỏ ký tự đặc biệt
    let questionText = question.question
      .substring(0, 50)
      .replace(/[^a-zA-Z0-9\s\u00C0-\u024F\u1E00-\u1EFF]/g, '') // Giữ lại chữ cái, số, khoảng trắng và ký tự tiếng Việt
      .replace(/\s+/g, '_') // Thay khoảng trắng bằng dấu gạch dưới
      .toLowerCase();

    if (questionText.length === 0) {
      questionText = 'cau_hoi';
    }

    const timestamp = Date.now();
    const indexSuffix = index !== undefined ? `_${index + 1}` : '';
    
    return `${questionText}${indexSuffix}_${timestamp}.txt`;
  }

  /**
   * Format câu hỏi thành text dễ đọc
   */
  private static formatQuestionAsText(
    question: GeneratedQuestion,
    metadata?: {
      subject?: string;
      topic?: string;
      difficulty?: string;
    },
    timestamp?: number
  ): string {
    const date = timestamp ? new Date(timestamp).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN');
    
    let content = `=== THÔNG TIN CÂU HỎI ===\n`;
    content += `Thời gian tạo: ${date}\n`;
    if (metadata?.subject) content += `Môn học: ${metadata.subject}\n`;
    if (metadata?.topic) content += `Chủ đề: ${metadata.topic}\n`;
    if (metadata?.difficulty) content += `Độ khó: ${metadata.difficulty}\n`;
    content += `\n=== NỘI DUNG CÂU HỎI ===\n`;
    content += `${question.question}\n\n`;

    // Format theo loại câu hỏi
    switch (question.type) {
      case 'multiple_choice':
      case 'multiple_choice_reading1':
      case 'multiple_choice_reading2':
        if (question.passage) {
          content += `=== ĐOẠN VĂN ===\n`;
          content += `${question.passage}\n\n`;
        }
        
        if (question.clozeBlanks) {
          content += `=== CÁC CHỖ TRỐNG ===\n`;
          question.clozeBlanks.forEach((blank) => {
            content += `Chỗ trống ${blank.number}:\n`;
            blank.options.forEach((option, index) => {
              const letter = String.fromCharCode(65 + index);
              content += `  ${letter}. ${option}\n`;
            });
            content += `  Đáp án: ${blank.correctAnswer}\n\n`;
          });
        } else if (question.readingQuestions) {
          content += `=== CÁC CÂU HỎI ===\n`;
          question.readingQuestions.forEach((q) => {
            content += `Câu ${q.number}: ${q.question}\n`;
            q.options.forEach((option, index) => {
              const letter = String.fromCharCode(65 + index);
              content += `  ${letter}. ${option}\n`;
            });
            content += `  Đáp án: ${q.correctAnswer}\n\n`;
          });
        } else if (question.options) {
          content += `=== CÁC LỰA CHỌN ===\n`;
          question.options.forEach((option, index) => {
            const letter = String.fromCharCode(65 + index);
            content += `${letter}. ${option}\n`;
          });
          content += `\n=== ĐÁP ÁN ĐÚNG ===\n`;
          content += `${question.correctAnswer}\n`;
        }
        break;

      case 'true_false':
        if (question.statements && question.statementAnswers) {
          content += `=== CÁC PHÁT BIỂU ===\n`;
          question.statements.forEach((statement, index) => {
            content += `${index + 1}. ${statement}\n`;
            content += `   Đáp án: ${question.statementAnswers![index] ? 'Đúng' : 'Sai'}\n`;
            if (question.statementExplanations?.[index]) {
              content += `   Giải thích: ${question.statementExplanations[index]}\n`;
            }
            content += `\n`;
          });
        } else {
          content += `=== ĐÁP ÁN ===\n`;
          content += `${question.correctAnswer}\n`;
        }
        break;

      case 'essay':
      case 'essay_reading':
      case 'essay_writing':
        if (question.passage) {
          content += `=== ĐOẠN VĂN THAM KHẢO ===\n`;
          content += `${question.passage}\n\n`;
        }
        content += `=== GỢI Ý TRẢ LỜI ===\n`;
        content += `${question.correctAnswer || 'Không có gợi ý'}\n`;
        break;

      case 'fill_in_blank':
        content += `=== ĐÁP ÁN ===\n`;
        if (question.blanks) {
          question.blanks.forEach((answer, index) => {
            content += `Chỗ trống ${index + 1}: ${answer}\n`;
          });
        } else if (Array.isArray(question.correctAnswer)) {
          question.correctAnswer.forEach((answer, index) => {
            content += `Chỗ trống ${index + 1}: ${answer}\n`;
          });
        } else {
          content += `${question.correctAnswer}\n`;
        }
        break;

      case 'matching':
        content += `=== CẶP GHÉP ĐÚNG ===\n`;
        if (question.correctMatches) {
          Object.entries(question.correctMatches).forEach(([left, right], index) => {
            content += `${index + 1}. ${left} → ${right}\n`;
          });
        } else if (question.leftItems && question.rightItems) {
          content += `Cột trái: ${question.leftItems.join(', ')}\n`;
          content += `Cột phải: ${question.rightItems.join(', ')}\n`;
        }
        break;

      case 'ordering':
        content += `=== THỨ TỰ ĐÚNG ===\n`;
        if (question.correctOrder && question.items) {
          question.correctOrder.forEach((orderIndex, position) => {
            content += `${position + 1}. ${question.items![orderIndex]}\n`;
          });
        } else if (Array.isArray(question.correctAnswer)) {
          question.correctAnswer.forEach((item, index) => {
            content += `${index + 1}. ${item}\n`;
          });
        }
        break;

      default:
        if (question.correctAnswer) {
          content += `=== ĐÁP ÁN ===\n`;
          content += `${question.correctAnswer}\n`;
        }
    }

    if (question.explanation) {
      content += `\n=== GIẢI THÍCH ===\n`;
      content += `${question.explanation}\n`;
    }

    return content;
  }
}