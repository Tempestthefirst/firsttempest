import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, HourGlassPlan } from '@/store/useStore';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Hourglass, 
  Plus, 
  Calendar, 
  Pause, 
  Play, 
  X, 
  Target,
  Clock,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

export default function HourGlass() {
  const { user, hourGlassPlans, createHourGlassPlan, pauseHourGlassPlan, resumeHourGlassPlan, cancelHourGlassPlan, processHourGlassDeductions } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [endDate, setEndDate] = useState('');
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [deductionAmount, setDeductionAmount] = useState('');

  // Process deductions on mount and every 10 seconds
  useEffect(() => {
    processHourGlassDeductions();
    const interval = setInterval(() => {
      processHourGlassDeductions();
    }, 10000);
    return () => clearInterval(interval);
  }, [processHourGlassDeductions]);

  if (!user) return null;

  const activePlans = hourGlassPlans.filter(p => p.status === 'active' || p.status === 'paused');
  const completedPlans = hourGlassPlans.filter(p => p.status === 'completed');

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetNum = parseFloat(targetAmount);
    const deductionNum = parseFloat(deductionAmount);
    
    if (!name.trim()) {
      toast.error('Please enter a plan name');
      return;
    }
    if (!targetNum || targetNum <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }
    if (!endDate) {
      toast.error('Please select an end date');
      return;
    }
    if (!deductionNum || deductionNum <= 0) {
      toast.error('Please enter a valid deduction amount');
      return;
    }
    if (deductionNum > user.balance) {
      toast.error('Insufficient balance for first deduction');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const planId = createHourGlassPlan({
      name: name.trim(),
      targetAmount: targetNum,
      endDate: new Date(endDate),
      recurrence,
      deductionAmount: deductionNum,
    });

    setIsLoading(false);

    if (planId) {
      toast.success('Savings plan started!');
      setIsDialogOpen(false);
      setName('');
      setTargetAmount('');
      setEndDate('');
      setDeductionAmount('');
    } else {
      toast.error('Failed to create plan');
    }
  };

  const handlePause = (planId: string) => {
    pauseHourGlassPlan(planId);
    toast.success('Plan paused');
  };

  const handleResume = (planId: string) => {
    resumeHourGlassPlan(planId);
    toast.success('Plan resumed');
  };

  const handleCancel = (planId: string) => {
    cancelHourGlassPlan(planId);
    toast.success('Plan cancelled and funds returned');
  };

  const getProgress = (plan: HourGlassPlan) => {
    return Math.min((plan.currentAmount / plan.targetAmount) * 100, 100);
  };

  const getDaysRemaining = (plan: HourGlassPlan) => {
    return Math.max(0, differenceInDays(new Date(plan.endDate), new Date()));
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header />

      <div className="max-w-lg mx-auto px-4 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
              <Hourglass className="w-6 h-6 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">HourGlass</h1>
              <p className="text-sm text-muted-foreground">Automated Savings</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-success hover:bg-success/90 text-white rounded-full w-12 h-12 p-0"
                aria-label="Create new savings plan"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">New Savings Plan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePlan} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Emergency Fund"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Target Amount (₦)</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="0"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="h-12"
                    inputMode="numeric"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recurrence</Label>
                  <Select value={recurrence} onValueChange={(v: 'daily' | 'weekly' | 'monthly') => setRecurrence(v)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deduction">Deduction Amount (₦)</Label>
                  <Input
                    id="deduction"
                    type="number"
                    placeholder="0"
                    value={deductionAmount}
                    onChange={(e) => setDeductionAmount(e.target.value)}
                    className="h-12"
                    inputMode="numeric"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available: ₦{user.balance.toLocaleString()}
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-success hover:bg-success/90 text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Start Saving'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Active Plans */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {activePlans.length === 0 && completedPlans.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Hourglass className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Savings Plans</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Start saving automatically with HourGlass
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-success hover:bg-success/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan
                </Button>
              </motion.div>
            ) : (
              <>
                {activePlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="p-5 border-0 shadow-banking-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {plan.recurrence} • ₦{plan.deductionAmount.toLocaleString()}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          plan.status === 'active' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {plan.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">
                            ₦{plan.currentAmount.toLocaleString()} / ₦{plan.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={getProgress(plan)} 
                          className="h-3 bg-muted [&>div]:bg-success"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Next Deduction</p>
                            <p className="text-sm font-medium">
                              {format(new Date(plan.nextDeductionDate), 'MMM d')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Days Left</p>
                            <p className="text-sm font-medium">{getDaysRemaining(plan)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        {plan.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handlePause(plan.id)}
                          >
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleResume(plan.id)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Resume
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-destructive hover:text-destructive"
                          onClick={() => handleCancel(plan.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}

                {completedPlans.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      Completed
                    </h3>
                    {completedPlans.map((plan) => (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Card className="p-4 border-0 shadow-banking bg-success/5">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-8 h-8 text-success" />
                            <div className="flex-1">
                              <h4 className="font-semibold">{plan.name}</h4>
                              <p className="text-sm text-success">
                                ₦{plan.currentAmount.toLocaleString()} saved!
                              </p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Stats Card */}
        {activePlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <Card className="p-5 border-0 bg-foreground text-background">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6" />
                <h3 className="font-bold">Total Savings</h3>
              </div>
              <p className="text-3xl font-bold">
                ₦{activePlans.reduce((sum, p) => sum + p.currentAmount, 0).toLocaleString()}
              </p>
              <p className="text-sm opacity-70 mt-1">
                Across {activePlans.length} active plan{activePlans.length !== 1 ? 's' : ''}
              </p>
            </Card>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
