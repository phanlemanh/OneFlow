"use client";

import { useTranslations } from "next-intl";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SkillReplaceConfirmProps {
    open: boolean;
    onReplace: () => void;
    onCancel: () => void;
}

/**
 * Asked before "view/edit plan" overwrites a canvas that already has a graph.
 * Same shape as the Director's replace confirmation.
 */
export function SkillReplaceConfirm({
    open,
    onReplace,
    onCancel,
}: SkillReplaceConfirmProps) {
    const t = useTranslations("Skills");
    return (
        <AlertDialog
            open={open}
            onOpenChange={(next) => {
                if (!next) onCancel();
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t("confirmReplaceTitle")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("confirmReplaceBody")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>
                        {t("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onReplace}>
                        {t("replace")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
