"use client"
import { useSocketSubscribe } from '@/app/admin/_common/useSocketSubscribe'
import PageHeader from '@/app/admin/_components/PageHeader'
import XTerminal from '@/components/Terminal'
import React, { useEffect, useState } from 'react'


const Terminal = ({ params: { id } }: { params: { id: string } }) => {

  


  

    return (
        <div>
            <PageHeader>Server: {id}</PageHeader>
            <XTerminal id={id}/>
        </div>
    )
}

export default Terminal