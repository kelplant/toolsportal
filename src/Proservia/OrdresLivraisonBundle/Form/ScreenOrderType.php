<?php

namespace Proservia\OrdresLivraisonBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ScreenOrderType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('id', HiddenType::class, array(
                'label' => 'id',
            ))
            ->add('site', ChoiceType::class, array(
                'choices' => $options["allow_extra_fields"]["listeSite"],
                'preferred_choices' => 'Choisir un Site',
                'multiple' => false,
                'label' => 'Site à livrer',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'class' => 'form-control font_exo_2 input-md select2-single',
                ),
                'required' => true,
            ))
            ->add('qt24bd1', TextType::class, array(
                'label' => 'Quantité 24" 1 écran',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => '24" 1 écran',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('qt24bd2', TextType::class, array(
                'label' => 'Quantité 24" 2 écrans',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => '24" 2 écrans',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('qt22bd1', TextType::class, array(
                'label' => 'Quantité 22" 1 écran',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => '22" 1 écran',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('qt22bd2', TextType::class, array(
                'label' => 'Quantité 22" 2 écrans',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => '22" 2 écrans',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('qt19bd1', TextType::class, array(
                'label' => 'Quantité 19" 1 écran',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => '19" 1 écran',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('comments', TextareaType::class, array(
                'label' => 'Commentaires',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Commentaires',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
        ;
    }
    
    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Proservia\OrdresLivraisonBundle\Entity\ScreenOrder'
        ));
    }
}
