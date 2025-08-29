import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface AdminModalProps {
  show: boolean;
  onClose: () => void;
}

export default function AdminModal({ show, onClose }: AdminModalProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [deepseekEnabled, setDeepseekEnabled] = useState<boolean | null>(null);
  const [gpt5Enabled, setGpt5Enabled] = useState<boolean | null>(null);
  const [openrouterApiKey, setOpenrouterApiKey] = useState("");
  const [imgbbApiKey, setImgbbApiKey] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["/api/admin/settings"],
    enabled: isLoggedIn,
  });

  useEffect(() => {
    if (settings && typeof settings === 'object') {
      const settingsData = settings as any;
      setDeepseekEnabled(settingsData.deepseekEnabled ?? false);
      setGpt5Enabled(settingsData.gpt5Enabled ?? false);
      setOpenrouterApiKey(settingsData.openrouterApiKey === "***" ? "" : (settingsData.openrouterApiKey || ""));
      setImgbbApiKey(settingsData.imgbbApiKey === "***" ? "" : (settingsData.imgbbApiKey || ""));
    }
  }, [settings]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/admin/login", credentials);
      return response.json();
    },
    onSuccess: () => {
      setIsLoggedIn(true);
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn đến trang quản trị.",
      });
    },
    onError: (error) => {
      toast({
        title: "Đăng nhập thất bại",
        description: "Tài khoản hoặc mật khẩu không chính xác.",
        variant: "destructive",
      });
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: { deepseekEnabled: boolean; gpt5Enabled: boolean; openrouterApiKey: string; imgbbApiKey: string }) => {
      const response = await apiRequest("POST", "/api/admin/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Cài đặt đã được lưu",
        description: "Hệ thống sẽ sử dụng cấu hình mới.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi lưu cài đặt",
        description: "Không thể lưu cài đặt. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('sqlFile', file);
      return await fetch('/api/admin/import-database', {
        method: 'POST',
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Import thành công",
        description: "Database đã được khôi phục",
        variant: "default",
      });
      setImportFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      toast({
        title: "Lỗi import",
        description: "Không thể import database. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = () => {
    loginMutation.mutate({ username, password });
  };

  const handleSaveSettings = () => {
    if (deepseekEnabled === null || gpt5Enabled === null) {
      return; // Don't save if settings haven't loaded yet
    }
    saveSettingsMutation.mutate({ 
      deepseekEnabled, 
      gpt5Enabled, 
      openrouterApiKey,
      imgbbApiKey
    });
  };

  const handleDeepseekToggle = (enabled: boolean) => {
    setDeepseekEnabled(enabled);
    if (enabled) {
      setGpt5Enabled(false); // Auto-disable GPT-5 when DeepSeek is enabled
    }
  };

  const handleGpt5Toggle = (enabled: boolean) => {
    setGpt5Enabled(enabled);
    if (enabled) {
      setDeepseekEnabled(false); // Auto-disable DeepSeek when GPT-5 is enabled
    }
  };

  const handleImport = () => {
    if (importFile) {
      importMutation.mutate(importFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.sql')) {
      setImportFile(file);
    } else {
      toast({
        title: "File không hợp lệ",
        description: "Vui lòng chọn file .sql",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    // Keep the current AI model settings, don't reset them
    setOpenrouterApiKey("");
    setImgbbApiKey("");
  };

  const handleClose = () => {
    if (!isLoggedIn) {
      setUsername("");
      setPassword("");
    }
    onClose();
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quản trị hệ thống</DialogTitle>
          <DialogDescription>
            Đăng nhập để quản lý cài đặt AI và cấu hình hệ thống
          </DialogDescription>
        </DialogHeader>

        {!isLoggedIn ? (
          // Admin Login
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Tài khoản Admin</Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tài khoản"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-admin-username"
              />
            </div>
            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-admin-password"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleLogin}
              disabled={loginMutation.isPending}
              data-testid="button-admin-login"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </div>
        ) : (
          // Admin Dashboard
          <div className="space-y-6">
            {/* AI Model Toggle */}
            <div>
              <Label className="text-base font-medium mb-3 block">Cài đặt mô hình AI</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">DeepSeek R1</p>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        FREE
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">deepseek/deepseek-r1:free</p>
                  </div>
                  <Switch
                    id="deepseek-toggle"
                    checked={deepseekEnabled === true}
                    onCheckedChange={handleDeepseekToggle}
                    disabled={deepseekEnabled === null}
                    data-testid="switch-deepseek"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">GPT-5</p>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                        PAID
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">openai/gpt-5</p>
                  </div>
                  <Switch
                    id="gpt5-toggle"
                    checked={gpt5Enabled === true}
                    onCheckedChange={handleGpt5Toggle}
                    disabled={gpt5Enabled === null}
                    data-testid="switch-gpt5"
                  />
                </div>
                {deepseekEnabled === false && gpt5Enabled === false && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Cảnh báo: Không có mô hình AI nào được kích hoạt. Hệ thống sẽ không hoạt động.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* API Key Management */}
            <div>
              <Label className="text-base font-medium mb-3 block">Cấu hình API</Label>
              <div className="space-y-4">
                {/* OpenRouter API Key */}
                <div>
                  <Label htmlFor="apiKey" className="text-sm font-medium text-gray-700 mb-2 block">
                    OpenRouter API Key
                  </Label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        id="apiKey"
                        type={showApiKey ? "text" : "password"}
                        placeholder="sk-or-v1-... (nhập API key mới sẽ thay thế API cũ)"
                        value={openrouterApiKey}
                        onChange={(e) => setOpenrouterApiKey(e.target.value)}
                        data-testid="input-api-key"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowApiKey(!showApiKey)}
                        data-testid="button-toggle-api-key"
                      >
                        <i className={`fas ${showApiKey ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      💡 Khi nhập API key mới, API key cũ sẽ được xóa khỏi cơ sở dữ liệu
                    </p>
                  </div>
                </div>

                {/* ImgBB API Key */}
                <div>
                  <Label htmlFor="imgbbApiKey" className="text-sm font-medium text-gray-700 mb-2 block">
                    ImgBB API Key (để upload ảnh)
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="imgbbApiKey"
                      type={showApiKey ? "text" : "password"}
                      placeholder="Nhập ImgBB API key..."
                      value={imgbbApiKey}
                      onChange={(e) => setImgbbApiKey(e.target.value)}
                      data-testid="input-imgbb-api-key"
                    />
                    <p className="text-xs text-gray-500">
                      🖼️ Cần thiết cho tính năng upload ảnh trong kiểm tra bài tập
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex space-x-3">
                <Button
                  className="flex-1"
                  onClick={handleSaveSettings}
                  disabled={saveSettingsMutation.isPending || deepseekEnabled === null || gpt5Enabled === null}
                  data-testid="button-save-settings"
                >
                  <i className="fas fa-save mr-2"></i>
                  {saveSettingsMutation.isPending ? "Đang lưu..." : "Lưu cài đặt"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  data-testid="button-admin-logout"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Đăng xuất
                </Button>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open('/api/admin/export-database', '_blank')}
                  data-testid="button-export-database"
                >
                  <i className="fas fa-download mr-2"></i>
                  Tải Database
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-import-database"
                >
                  <i className="fas fa-upload mr-2"></i>
                  Khôi phục Database
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".sql"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              {importFile && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">File được chọn: {importFile.name}</p>
                  <Button
                    onClick={handleImport}
                    disabled={importMutation.isPending}
                    className="w-full"
                    data-testid="button-confirm-import"
                  >
                    {importMutation.isPending ? "Đang khôi phục..." : "Xác nhận khôi phục"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
