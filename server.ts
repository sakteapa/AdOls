import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client per skill guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * POST /api/tune-advisor
 * AI Calibration Engineer Copilot endpoint
 */
app.post('/api/tune-advisor', async (req: Request, res: Response) => {
  try {
    const { map, vehicle, userPrompt, cellDiffs, detectedHazards } = req.body;

    const systemInstruction = `You are a world-class automotive ECU Calibration Engineer and Software Engineer assisting a tuner at ApexECU Studio in Mizoram, India.
You specialize in Indian automotive and motorcycle ECU platforms:
- Mahindra (mHawk 2.2 CRDe, Scorpio, Thar with Bosch EDC17C55/EDC17C63)
- Maruti Suzuki (1.3 DDiS Multijet with Magneti Marelli MJD 6F3/8F3, 1.2 K-Series)
- Tata Motors (1.5 Revotorq with Delphi DCM 3.7 / Bosch EDC17)
- Royal Enfield (Classic 350 J-Series with Keihin EFI)
- KTM (Duke 390 with Bosch ME17.9.71)
- Hyundai/Kia (1.5 CRDi with Bosch EDC17C57)

Your mission:
1. Examine the user's manual map modifications, cell diffs, and reported hazards (overboost, lean AFR lambda spike, excessive ignition advance causing knock, or steep cell gradient cliffs).
2. Explain the physical risks to the engine components (turbocharger turbine overspeed, cylinder head gasket failure, detonation/pinging, piston crown melting, or drivability bucking).
3. Provide crisp, actionable calibration advice.
4. Always provide an explanation in natural everyday Mizo language (under analysisMizo) alongside concise English (under analysisEn).
5. Output valid JSON adhering to the requested schema.`;

    const promptText = `Vehicle: ${vehicle?.make || 'Unknown'} ${vehicle?.model || 'Vehicle'} (${vehicle?.engine || 'Engine'}, ${vehicle?.ecuFamily || 'ECU'})
Map Name: ${map?.name || 'Calibration Table'} (${map?.zUnit || 'values'})
Detected Client Hazards: ${JSON.stringify(detectedHazards || [])}
Altered Cells Summary: ${JSON.stringify(cellDiffs || 'None')}
User Inquiry: ${userPrompt || 'Analyze current manual modifications for safety hazards and suggest optimal calibration.'}

Please analyze these manual modifications, evaluate engine safety limits, and return advice.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      parsedData = {
        analysisEn: text,
        analysisMizo: 'AI Calibration Engineer-in map a enfiah a, fimkhurna rawtna a pe e.',
        hazards: detectedHazards || [],
        suggestedAction: 'smooth',
      };
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Tune Advisor API Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate calibration advice',
    });
  }
});

// Mount Vite middleware in development or static in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ApexECU Studio Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
