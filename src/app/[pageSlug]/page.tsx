import React from 'react';

import parse from 'html-react-parser';

import { pageContainerCls } from '@/components/layout/tailwindcss-class';
import PageHeader from '@/components/page-header';
import { PreprSdk } from '@/server/prepr';

export default async function PageBySlug({ params: { pageSlug } }) {
  const { Page } = await PreprSdk.Page({ slug: pageSlug });
  const filteredElement = [];

  function inspectElement(element) {
    const text = element?.props?.children;
    const className = element?.props?.className || '';
    if (typeof text === 'string' && !/script|iframe|object/gim.test(element.type)) {
      filteredElement.push({ Tag: element.type, text: escapeHtml(text), className });
    } else {
      React.Children.forEach(element, (child) => {
        inspectElement(child);
      });
    }
  }

  inspectElement(parse(Page.html));

  return (
    <>
      <PageHeader
        imageUrl={Page.page_header.image.url}
        title={Page.page_header.title}
        cls="h-[250px]"
        imgCls="md:!top-[-30%] !h-[initial]"
        overlayCls="bg-[rgba(0,0,0,0.3)]"
      />
      <main className={pageContainerCls}>
        {filteredElement.map(({ Tag, text, className }) => (
          <Tag className={className + ' mb-5'}>{text}</Tag>
        ))}
      </main>
    </>
  );
}

export async function generateMetadata({ params: { pageSlug } }) {
  const { Page } = await PreprSdk.Page({ slug: pageSlug });
  return { title: Page.title };
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, function (match) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[match];
  });
}
