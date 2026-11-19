const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const refreshSchema = z.object({
  refreshToken: z.string().optional()
});

const generateSessionSchema = z.object({
  tradition: z.enum(['pranayama', 'yoga_nidra', 'vipassana', 'trataka', 'general']).optional().default('pranayama'),
  mood: z.string().optional().default('Neutral'),
  stressLevel: z.number().min(1).max(10).optional().default(5),
  targetDuration: z.number().min(1).max(120).optional().default(10)
});

const startSessionSchema = z.object({
  title: z.string().optional(),
  tradition: z.enum(['pranayama', 'yoga_nidra', 'vipassana', 'trataka', 'general']).optional().default('pranayama'),
  category: z.enum(['Calm', 'Focus', 'Flow', 'Meditation']).optional().default('Meditation'),
  duration: z.number().min(1).max(180).default(10),
  baselineHeartRate: z.number().nullable().optional(),
  baselineHrv: z.number().nullable().optional(),
  baselineCalmScore: z.number().min(1).max(10).optional().default(5),
  moodBefore: z.string().optional(),
  breathRatios: z.object({
    inhale: z.number().default(4),
    hold: z.number().default(4),
    exhale: z.number().default(4),
    postHold: z.number().default(0)
  }).optional(),
  stages: z.array(z.object({
    secondOffset: z.number(),
    cue: z.string(),
    tone: z.string().optional()
  })).optional()
});

const completeSessionSchema = z.object({
  durationCompleted: z.number().min(0).optional(),
  exitHeartRate: z.number().nullable().optional(),
  exitHrv: z.number().nullable().optional(),
  exitCalmScore: z.number().min(1).max(10).optional().default(7),
  moodAfter: z.string().optional(),
  notes: z.string().optional(),
  breathSyncScore: z.number().min(0).max(100).optional().default(85)
});

const pacerSchema = z.object({
  heartRate: z.number().min(30).max(220).default(72),
  hrv: z.number().min(5).max(300).default(45),
  targetState: z.enum(['parasympathetic_activation', 'focus_enhancement', 'vagal_homeostasis']).optional().default('parasympathetic_activation')
});

module.exports = {
  signupSchema,
  loginSchema,
  refreshSchema,
  generateSessionSchema,
  startSessionSchema,
  completeSessionSchema,
  pacerSchema
};

