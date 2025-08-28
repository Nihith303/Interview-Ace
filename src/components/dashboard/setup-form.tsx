'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { startInterviewAction } from '@/app/dashboard/actions';
import { useToast } from '@/hooks/use-toast';
import type { GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';
import type { GenerateInterviewQuestionsInput } from '@/ai/flows/generate-interview-questions';
import { Loader2 } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const formSchema = z.object({
  role: z.string().min(2, 'Role must be at least 2 characters.'),
  company: z.string().min(2, 'Company must be at least 2 characters.'),
  resume: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'Resume file is required.')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      '.pdf and .docx files are accepted.'
    ),
});

type SetupFormProps = {
  onInterviewStart: (
    questions: GenerateInterviewQuestionsOutput,
    config: GenerateInterviewQuestionsInput
  ) => void;
};

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function SetupForm({ onInterviewStart }: SetupFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: '',
      company: '',
      resume: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const resumeFile = values.resume[0];
    const resumeDataUri = await fileToDataUri(resumeFile);

    const submissionData = {
      role: values.role,
      company: values.company,
      resume: resumeDataUri,
    };

    const result = await startInterviewAction(submissionData);
    if (result.success && result.data) {
      onInterviewStart(result.data, submissionData);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error generating questions',
        description:
          result.error ||
          'There was a problem with the AI. Please try again.',
      });
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Prepare for your interview
        </CardTitle>
        <CardDescription>
          Fill in the details below to start your personalized practice session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Role</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Senior Software Engineer"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="resume"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Your Resume</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) => {
                        onChange(e.target.files);
                      }}
                      {...rest}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload your resume (.pdf, .docx) for tailored questions. Max
                    5MB.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                'Start Interview'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
