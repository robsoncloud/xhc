import React from 'react'
import PageHeader from '../_components/PageHeader'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreVertical } from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Link from 'next/link'



const ComputersPage = () => {
    
    return (
        <div>
            <PageHeader>Computers</PageHeader>
            <ComputersTable />

        </div>
    )
}

export default ComputersPage

function ComputersTable() {
    return (
        <Table className='mx-auto max-w-4xl'>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Logged User</TableHead>

                    <TableHead className="w-0"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell className="font-medium">WDCDC01</TableCell>
                    <TableCell>Online</TableCell>
                    <TableCell>192.168.201.254</TableCell>
                    <TableCell>robson.carvalho</TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <MoreVertical />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem asChild>
                                   
                                    <Link href="/admin/computers/wdcdc01/terminal">
                                        Remote Assistent
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                   
                                    <Link href="/admin/computers/wdcdc01/terminal">
                                        Terminal
                                    </Link>
                                </DropdownMenuItem>
                                
                            </DropdownMenuContent>
                        </DropdownMenu>

                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>

    )
}