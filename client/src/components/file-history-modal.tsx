import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import { FileHistoryManager, FileHistoryItem } from '../lib/file-history-manager';
import { 
  Search, 
  Download, 
  Trash2, 
  FileText, 
  Calendar, 
  Filter,
  BarChart3,
  Archive,
  Eye,
  ExternalLink
} from 'lucide-react';

interface FileHistoryModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FileHistoryModal({ trigger, open, onOpenChange }: FileHistoryModalProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<FileHistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FileHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<FileHistoryItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Controlled state
  const modalOpen = open !== undefined ? open : isOpen;
  const setModalOpen = onOpenChange || setIsOpen;

  // Load history when modal opens
  useEffect(() => {
    if (modalOpen) {
      loadHistory();
    }
  }, [modalOpen]);

  // Apply filters
  useEffect(() => {
    let filtered = historyItems;

    // Search filter
    if (searchQuery.trim()) {
      filtered = FileHistoryManager.searchIndex(searchQuery);
    }

    // Subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(item => item.subject === subjectFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(item => item.difficulty === difficultyFilter);
    }

    setFilteredItems(filtered);
  }, [historyItems, searchQuery, subjectFilter, difficultyFilter]);

  const loadHistory = () => {
    try {
      const items = FileHistoryManager.getIndex();
      setHistoryItems(items);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch sử file",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    try {
      const success = FileHistoryManager.deleteFromIndex(id);
      if (success) {
        loadHistory();
        toast({
          title: "Thành công",
          description: "Đã xóa file khỏi lịch sử",
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể xóa file",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xóa file",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = () => {
    try {
      FileHistoryManager.clearIndex();
      loadHistory();
      toast({
        title: "Thành công",
        description: "Đã xóa toàn bộ lịch sử file",
      });
    } catch (error) {
      console.error('Lỗi khi xóa tất cả:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xóa lịch sử",
        variant: "destructive",
      });
    }
  };

  const handleExportIndex = () => {
    try {
      const indexData = FileHistoryManager.exportIndex();
      const blob = new Blob([indexData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `file_history_index_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Thành công",
        description: "Đã xuất danh sách lịch sử file",
      });
    } catch (error) {
      console.error('Lỗi khi xuất:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xuất danh sách",
        variant: "destructive",
      });
    }
  };

  const handlePreviewItem = (item: FileHistoryItem) => {
    setSelectedItem(item);
    setIsPreviewOpen(true);
  };

  const getSubjectName = (subject: string) => {
    const subjects: { [key: string]: string } = {
      'toan': 'Toán học',
      'ly': 'Vật lý',
      'hoa': 'Hóa học',
      'sinh': 'Sinh học',
      'van': 'Ngữ văn',
      'anh': 'Tiếng Anh',
      'tin': 'Tin học',
    };
    return subjects[subject] || subject;
  };

  const getDifficultyName = (difficulty: string) => {
    const difficulties: { [key: string]: string } = {
      'easy': 'Dễ',
      'medium': 'Trung bình',
      'hard': 'Khó',
      'expert': 'Chuyên gia',
    };
    return difficulties[difficulty] || difficulty;
  };

  const getStats = () => {
    return FileHistoryManager.getStats();
  };

  const stats = getStats();

  return (
    <>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Lịch sử File Câu hỏi
            </DialogTitle>
            <DialogDescription>
              Quản lý các file câu hỏi đã được lưu riêng biệt
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="list" className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Danh sách File</TabsTrigger>
              <TabsTrigger value="stats">Thống kê</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="flex-1 overflow-hidden">
              <div className="space-y-4 h-full">
                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="search">Tìm kiếm</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Tìm kiếm trong câu hỏi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="min-w-[150px]">
                    <Label>Môn học</Label>
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả môn</SelectItem>
                        <SelectItem value="toan">Toán học</SelectItem>
                        <SelectItem value="ly">Vật lý</SelectItem>
                        <SelectItem value="hoa">Hóa học</SelectItem>
                        <SelectItem value="sinh">Sinh học</SelectItem>
                        <SelectItem value="van">Ngữ văn</SelectItem>
                        <SelectItem value="anh">Tiếng Anh</SelectItem>
                        <SelectItem value="tin">Tin học</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-[150px]">
                    <Label>Độ khó</Label>
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả độ khó</SelectItem>
                        <SelectItem value="easy">Dễ</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="hard">Khó</SelectItem>
                        <SelectItem value="expert">Chuyên gia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="outline" onClick={handleExportIndex}>
                    <Download className="h-4 w-4 mr-2" />
                    Xuất danh sách
                  </Button>

                  <Button variant="destructive" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa tất cả
                  </Button>
                </div>

                {/* File List */}
                <ScrollArea className="flex-1 h-[400px]">
                  <div className="space-y-3">
                    {filteredItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Không có file nào trong lịch sử</p>
                      </div>
                    ) : (
                      filteredItems.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium text-sm text-muted-foreground">
                                    {item.filename}
                                  </span>
                                </div>
                                
                                <h3 className="font-medium mb-2 line-clamp-2">
                                  {item.question.question}
                                </h3>
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {item.subject && (
                                    <Badge variant="secondary">
                                      {getSubjectName(item.subject)}
                                    </Badge>
                                  )}
                                  {item.difficulty && (
                                    <Badge variant="outline">
                                      {getDifficultyName(item.difficulty)}
                                    </Badge>
                                  )}
                                  {item.topic && (
                                    <Badge variant="outline">
                                      {item.topic}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {FileHistoryManager.formatTimestamp(item.timestamp)}
                                </div>
                              </div>
                              
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePreviewItem(item)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Tổng số file</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalFiles}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Môn học</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.subjects).map(([subject, count]) => (
                        <div key={subject} className="flex justify-between text-sm">
                          <span>{getSubjectName(subject)}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Độ khó</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.difficulties).map(([difficulty, count]) => (
                        <div key={difficulty} className="flex justify-between text-sm">
                          <span>{getDifficultyName(difficulty)}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">File gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {stats.recentFiles.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded border">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.question.question}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {FileHistoryManager.formatTimestamp(item.timestamp)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePreviewItem(item)}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Xem trước câu hỏi</DialogTitle>
            <DialogDescription>
              {selectedItem?.filename}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <ScrollArea className="flex-1 max-h-[60vh]">
              <div className="space-y-4 p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedItem.subject && (
                    <Badge variant="secondary">
                      {getSubjectName(selectedItem.subject)}
                    </Badge>
                  )}
                  {selectedItem.difficulty && (
                    <Badge variant="outline">
                      {getDifficultyName(selectedItem.difficulty)}
                    </Badge>
                  )}
                  {selectedItem.topic && (
                    <Badge variant="outline">
                      {selectedItem.topic}
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Câu hỏi:</h3>
                  <p className="whitespace-pre-wrap">{selectedItem.question.question}</p>
                </div>

                {selectedItem.question.options && (
                  <div>
                    <h3 className="font-semibold mb-2">Các lựa chọn:</h3>
                    <ul className="space-y-1">
                      {selectedItem.question.options.map((option, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="font-medium">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span>{option}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedItem.question.correctAnswer && (
                  <div>
                    <h3 className="font-semibold mb-2">Đáp án đúng:</h3>
                    <p className="text-green-600 font-medium">
                      {selectedItem.question.correctAnswer}
                    </p>
                  </div>
                )}

                {selectedItem.question.explanation && (
                  <div>
                    <h3 className="font-semibold mb-2">Giải thích:</h3>
                    <p className="whitespace-pre-wrap">{selectedItem.question.explanation}</p>
                  </div>
                )}

                <Separator />
                
                <div className="text-sm text-muted-foreground">
                  <p>Tạo lúc: {FileHistoryManager.formatTimestamp(selectedItem.timestamp)}</p>
                  <p>ID: {selectedItem.id}</p>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}