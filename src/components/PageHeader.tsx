interface PageHeaderProps {
    title: string;
    description?: string;
}

const PageHeader = ({ title, description }: PageHeaderProps) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span className="text-sm font-medium text-black dark:text-white" style={{ lineHeight: 1, letterSpacing: '-0.01em' }}>
                {title}
            </span>
            {description && (
                <span className="hidden md:block text-bodydark2 dark:text-bodydark" style={{ fontSize: '11px', lineHeight: 1, letterSpacing: '0.01em' }}>
                    {description}
                </span>
            )}
        </div>
    );
};

export default PageHeader;