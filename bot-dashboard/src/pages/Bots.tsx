import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Bot, Activity, GitBranch, AlertCircle, Check, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';
// TODO: Break into more components

interface BotData {
  id: number;
  name: string;
  description: string;
  review_prompt: string;
  evaluation_prompt: string;
  repositories: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BotFormData {
  name: string;
  description: string;
  review_prompt: string;
  evaluation_prompt: string;
  repositories: string;
  is_active: boolean;
}

const BotDashboard: React.FC = () => {
  const [bots, setBots] = useState<BotData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBot, setEditingBot] = useState<BotData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<BotFormData>({
    name: '',
    description: '',
    review_prompt: '',
    evaluation_prompt: '',
    repositories: '',
    is_active: true
  });

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/bots/`);
      if (!response.ok) throw new Error('Failed to fetch bots');
      const data: any = await response.json();
      setBots(
        data.map((bot: any) => ({
          ...bot,
          repositories: bot.repositories.join(", "),
        }))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!FormData.name.trim()) {
      setError('Bot name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = editingBot
        ? `${API_BASE_URL}/bots/${editingBot.id}/`
        : `${API_BASE_URL}/bots/`;

      const method = editingBot ? 'PUT' : 'POST';

      console.log(formData)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, repositories: formData.repositories.split(",").map(item => item.trim()) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Object.values(errorData).flat().join(', ');
        throw new Error(errorMessage);
      }

      setSuccess(editingBot ? 'Bot updated successfully!' : 'Bot created successfully!');
      setTimeout(() => setSuccess(null), 3000);

      closeModal();
      fetchBots();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (botId: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this bot?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/bots/${botId}/`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete bot');

      setSuccess('Bot deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchBots();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (bot: BotData | null = null): void => {
    if (bot) {
      setEditingBot(bot);
      setFormData({
        name: bot.name,
        description: bot.description,
        review_prompt: bot.review_prompt,
        evaluation_prompt: bot.evaluation_prompt,
        repositories: bot.repositories,
        is_active: bot.is_active
      });
    } else {
      setEditingBot(null);
      setFormData({
        name: '',
        description: '',
        review_prompt: '',
        evaluation_prompt: '',
        repositories: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setEditingBot(null);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Bot Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your automated bots</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Create Bot
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {error && !isModalOpen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && bots.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : bots.length === 0 ? (
          <div className="text-center py-20">
            <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No bots yet</h3>
            <p className="text-slate-500 mb-6">Get started by creating your first bot</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Your First Bot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                        <Bot className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{bot.name}</h3>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          <span className={`text-xs px-2 py-1 rounded-full ${bot.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                            }`}>
                            {bot.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {bot.description || 'No description provided'}
                  </p>

                  {bot.repositories && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 pb-4 border-b border-slate-100">
                      <GitBranch className="w-4 h-4" />
                      <span className="truncate">{bot.repositories}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(bot)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bot.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingBot ? 'Edit Bot' : 'Create New Bot'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bot Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter bot name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Describe what this bot does"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Review Prompt
                </label>
                <textarea
                  name="review_prompt"
                  value={formData.review_prompt}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter review prompt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Evaluation Prompt
                </label>
                <textarea
                  name="evaluation_prompt"
                  value={formData.evaluation_prompt}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter evaluation prompt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Repositories (Ideally would be multi select from a list of repos)
                </label>
                <input
                  type="text"
                  name="repositories"
                  value={formData.repositories}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., owner/repo1, owner/repo2"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                  Bot is active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                >
                  {loading ? 'Saving...' : editingBot ? 'Update Bot' : 'Create Bot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotDashboard;