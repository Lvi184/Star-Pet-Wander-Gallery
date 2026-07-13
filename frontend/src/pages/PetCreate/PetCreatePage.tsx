import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePetStore } from '../../stores/petStore';

const SPECIES_OPTIONS = [
  { id: 'fox', name: '九尾狐', emoji: '🦊', personality: '灵动狡黠，好奇心强', defaultPersonality: '灵动狡黠' },
  { id: 'dragon', name: '应龙', emoji: '🐉', personality: '威严深沉，智慧卓绝', defaultPersonality: '威严深沉' },
  { id: 'phoenix', name: '朱雀', emoji: '🦅', personality: '热情如火，高贵骄傲', defaultPersonality: '热情高贵' },
  { id: 'turtle', name: '玄武', emoji: '🐢', personality: '沉稳持重，坚韧不拔', defaultPersonality: '沉稳持重' },
  { id: 'tiger', name: '白虎', emoji: '🐯', personality: '勇猛刚毅，快意恩仇', defaultPersonality: '勇猛刚毅' },
  { id: 'qilin', name: '麒麟', emoji: '🦄', personality: '仁厚慈悲，祥和宁静', defaultPersonality: '仁厚慈悲' },
];

const PERSONALITY_PRESETS = [
  '灵动狡黠', '威严深沉', '温柔治愈', '活泼好动', '慵懒闲散', '好奇心重',
];

export default function PetCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'species' | 'personality' | 'preview'>('species');
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [personalityType, setPersonalityType] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customPersonality, setCustomPersonality] = useState<string>('');
  const [petName, setPetName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createCharacter = usePetStore((s) => s.createCharacter);
  const selectPet = usePetStore((s) => s.selectPet);

  const species = SPECIES_OPTIONS.find((s) => s.id === selectedSpecies);
  const personalityText = personalityType === 'preset' ? selectedPreset : customPersonality;

  const nameValid = petName.length >= 2 && petName.length <= 8;

  const goNext = () => {
    if (step === 'species' && selectedSpecies) {
      setStep('personality');
      const s = SPECIES_OPTIONS.find((x) => x.id === selectedSpecies);
      if (s && !selectedPreset) setSelectedPreset(s.defaultPersonality);
    } else if (step === 'personality' && personalityText) {
      setStep('preview');
    }
  };

  const goBack = () => {
    if (step === 'personality') setStep('species');
    else if (step === 'preview') setStep('personality');
  };

  const handleCreate = async () => {
    if (!selectedSpecies || !nameValid || creating) return;
    setCreating(true);
    setError(null);
    try {
      const newPet = await createCharacter({
        name: petName,
        species: selectedSpecies,
        personality: personalityText,
      });
      selectPet(newPet.id);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '召唤失败，请重试');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen w-full starfield flex items-center justify-center p-4">
      <div className="glass-dark w-full max-w-4xl overflow-hidden">
        <div className="p-6 border-b border-cosmos-800/50">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gradient-cosmos">🌟 召唤星宠</h1>
            <button
              onClick={() => navigate('/')}
              className="px-3 py-1.5 rounded-lg text-cosmos-300 hover:text-white hover:bg-cosmos-800/50 transition-all text-sm"
            >
              返回
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {['species', 'personality', 'preview'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s
                      ? 'bg-cosmos-500 text-white'
                      : ['species', 'personality'].indexOf(step) > i
                      ? 'bg-jade-500 text-white'
                      : 'bg-cosmos-900 text-cosmos-500 border border-cosmos-700'
                  }`}
                >
                  {['species', 'personality'].indexOf(step) > i ? '✓' : i + 1}
                </div>
                <span className={`text-sm ${step === s ? 'text-white' : 'text-cosmos-400'}`}>
                  {s === 'species' ? '选择种族' : s === 'personality' ? '配置性格' : '确认召唤'}
                </span>
                {i < 2 && <div className="w-8 h-px bg-cosmos-700 ml-2" />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 min-h-[400px]">
          {step === 'species' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">选择你的灵兽种族</h2>
              <div className="grid grid-cols-3 gap-3">
                {SPECIES_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSpecies(s.id)}
                    className={`p-4 rounded-xl text-left transition-all border ${
                      selectedSpecies === s.id
                        ? 'border-cosmos-400 bg-cosmos-800/60 shadow-lg shadow-cosmos-500/20 scale-[1.02]'
                        : 'border-cosmos-800/50 bg-cosmos-950/40 hover:border-cosmos-600 hover:bg-cosmos-900/50'
                    }`}
                  >
                    <div className="text-5xl text-center mb-2">{s.emoji}</div>
                    <div className="text-center font-semibold text-white">{s.name}</div>
                    <div className="text-center text-xs text-cosmos-400 mt-1">{s.personality}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'personality' && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">配置灵兽性格</h2>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setPersonalityType('preset')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    personalityType === 'preset'
                      ? 'border-cosmos-400 bg-cosmos-800/60 text-white'
                      : 'border-cosmos-800/50 bg-cosmos-950/40 text-cosmos-300 hover:border-cosmos-600'
                  }`}
                >
                  预设性格
                </button>
                <button
                  onClick={() => setPersonalityType('custom')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    personalityType === 'custom'
                      ? 'border-cosmos-400 bg-cosmos-800/60 text-white'
                      : 'border-cosmos-800/50 bg-cosmos-950/40 text-cosmos-300 hover:border-cosmos-600'
                  }`}
                >
                  自定义
                </button>
              </div>

              {personalityType === 'preset' && (
                <div className="flex flex-wrap gap-2">
                  {PERSONALITY_PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPreset(p)}
                      className={`px-4 py-2 rounded-full text-sm transition-all border ${
                        selectedPreset === p
                          ? 'border-gold-400 bg-gold-500/20 text-gold-300'
                          : 'border-cosmos-700/50 bg-cosmos-900/40 text-cosmos-300 hover:border-cosmos-500'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {personalityType === 'custom' && (
                <div>
                  <textarea
                    value={customPersonality}
                    onChange={(e) => setCustomPersonality(e.target.value.slice(0, 50))}
                    placeholder="描述灵兽的性格特点..."
                    className="w-full h-24 rounded-lg bg-cosmos-900/40 border border-cosmos-800/50 p-3 text-white placeholder-cosmos-500 focus:border-cosmos-500 focus:outline-none resize-none"
                  />
                  <div className="text-right text-xs text-cosmos-500 mt-1">
                    {customPersonality.length}/50
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="flex gap-6">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-4">为你的灵兽命名</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-cosmos-300 mb-2">灵兽名称 (2-8 字)</label>
                    <input
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="给它取个名字吧..."
                      className={`w-full rounded-lg bg-cosmos-900/40 border p-3 text-white placeholder-cosmos-500 focus:outline-none transition-colors ${
                        petName && !nameValid
                          ? 'border-red-500 focus:border-red-400'
                          : 'border-cosmos-800/50 focus:border-cosmos-500'
                      }`}
                    />
                    {petName && !nameValid && (
                      <div className="text-xs text-red-400 mt-1">名称需 2-8 字</div>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-cosmos-900/40 border border-cosmos-800/50">
                    <div className="text-sm text-cosmos-400 mb-2">种族</div>
                    <div className="text-white font-medium">
                      {species?.emoji} {species?.name}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-cosmos-900/40 border border-cosmos-800/50">
                    <div className="text-sm text-cosmos-400 mb-2">性格</div>
                    <div className="text-white font-medium">{personalityText}</div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-48 flex flex-col items-center justify-center">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-cosmos-400 to-gold-400 flex items-center justify-center text-7xl shadow-2xl shadow-cosmos-500/30 float-animation">
                  {species?.emoji}
                </div>
                <div className="mt-4 text-xl font-bold text-white">
                  {petName || '？？？'}
                </div>
                <div className="text-sm text-cosmos-400">{species?.name}</div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-cosmos-800/50 flex items-center justify-between">
          <button
            onClick={step === 'species' ? () => navigate('/') : goBack}
            disabled={creating}
            className="px-5 py-2 rounded-lg border border-cosmos-700/50 text-cosmos-300 hover:bg-cosmos-800/50 transition-all disabled:opacity-50"
          >
            {step === 'species' ? '取消' : '上一步'}
          </button>

          {step !== 'preview' ? (
            <button
              onClick={goNext}
              disabled={(step === 'species' && !selectedSpecies) || (step === 'personality' && !personalityText)}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cosmos-500 to-gold-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              下一步
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!nameValid || creating}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cosmos-500 to-gold-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cosmos-500/20"
            >
              {creating ? '召唤中...' : '✨ 召唤'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
