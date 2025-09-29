import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, HelpCircle, Eye, CheckCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useLatexRenderer } from "../lib/latex-renderer";
import { PDFPreviewModal } from "./pdf-preview-modal";
import { historyManager } from "../lib/history-manager";
import { FileHistoryManager } from "../lib/file-history-manager";
import type { QuestionRequest } from "../../../shared/schema";

interface GeneratedQuestionsProps {
  questions: QuestionRequest | null;
}

export function GeneratedQuestions({ questions }: GeneratedQuestionsProps) {
  const { toast } = useToast();
  const { renderMath } = useLatexRenderer();
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isAutoSaved, setIsAutoSaved] = useState(false);
  const hasAutoSavedRef = useRef(false);

  useEffect(() => {
    if (questions?.generatedQuestions?.length) {
      // Render LaTeX after questions are displayed
      setTimeout(renderMath, 100);
      
      // Auto-save questions to history (only once per question set)
      // TEMPORARILY DISABLED - Auto-save functionality
      /*
      if (!hasAutoSavedRef.current) {
        try {
          // Lưu vào localStorage history (existing functionality)
          historyManager.saveHistoryEntry(questions);
          
          // Lưu từng câu hỏi vào file riêng biệt
          const metadata = {
            subject: questions.subject,
            topic: questions.topic,
            difficulty: questions.difficulty
          };
          
          questions.generatedQuestions.forEach(async (question) => {
            try {
              await FileHistoryManager.saveQuestionToFile(question, metadata);
            } catch (error) {
              console.error("Failed to save question to file:", error);
            }
          });
          
          setIsAutoSaved(true);
          hasAutoSavedRef.current = true;
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }
      */
    } else {
      // Reset auto-save state when no questions
      hasAutoSavedRef.current = false;
      setIsAutoSaved(false);
    }
  }, [questions, renderMath]);

  const openPreview = () => {
    if (!questions?.generatedQuestions?.length) {
      toast({
        title: "Không có câu hỏi",
        description: "Vui lòng tạo câu hỏi trước khi xem trước",
        variant: "destructive"
      });
      return;
    }
    setIsPDFModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-secondary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Câu hỏi đã tạo</h2>
            </div>

          </div>

          {!questions?.generatedQuestions ? (
            <div className="text-center py-12" data-testid="empty-state">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">Chưa có câu hỏi nào</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Điền thông tin bên trái và nhấn "Sinh câu hỏi" để tạo câu hỏi thi tự động
              </p>
            </div>
          ) : (
            <div className="text-center py-8" data-testid="questions-success">
              <div className="mb-6">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-base font-medium text-foreground mb-2">
                  Đã tạo {questions.generatedQuestions.length} câu hỏi
                </h3>
                <p className="text-sm text-muted-foreground">
                  Nhấn "Xem" để xem câu hỏi bạn nhé
                </p>
              </div>
              
              <Button
                onClick={openPreview}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2"
                data-testid="button-preview"
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem
              </Button>

              {/* PDF Preview Modal */}
              <PDFPreviewModal
                isOpen={isPDFModalOpen}
                onClose={() => setIsPDFModalOpen(false)}
                questions={questions}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}