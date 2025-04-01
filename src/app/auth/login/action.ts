'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


export async function login(formData: FormData) {
    // Validate inputs
    const email = formData.get('email')
    const password = formData.get('password')


    if (!email || !password ||
        typeof email !== 'string' ||
        typeof password !== 'string') {
        throw new Error('Invalid form data')
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    })


    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    // type-casting here for convenience
    // in practice, you should validate your inputs
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayname = formData.get('displayname') as string;

    // TODO: Fix Display Name
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { displayname },
        },
    });

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}