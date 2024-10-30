import { Line, ResponsiveContainer, LineChart, XAxis } from 'recharts';
import { useMemo } from 'react';
import Link from 'next/link';

import Tile from '~/core/ui/Tile';
import LogoImage from '~/core/ui/Logo/LogoImage';
import loadingGif from './newmaker/new/public/assets/images/loaderr.gif'; // Import your gif
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/core/ui/Table';

export default function DashboardDemo() {


  return (
    <div className="flex flex-col items-center min-h-screen p-6 space-y-6">
      <LogoImage style={{ width: '160px', height: '100px' }} />
      <h1 className="text-2xl font-bold mb-4">Welcome to  Trade Companion Dashboard</h1>
      <img src="https://firebasestorage.googleapis.com/v0/b/test7-8a527.appspot.com/o/loader3.gif?alt=media&token=b095ed40-ac2d-4368-8bd3-e6f5bce9aa3e" alt="Loading..." className="mb-4" />
      <p className="text-center max-w-prose text-blue-700 italic">
        <ul className="list-disc list-inside">
      

        </ul>
      </p>
    </div>
  );
}